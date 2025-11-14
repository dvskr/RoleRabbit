/**
 * OpenAPI Schemas for Storage API Endpoints
 * Defines request/response schemas for all storage operations
 */

// Common schemas
const fileSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', description: 'Unique file identifier' },
    userId: { type: 'string', description: 'Owner user ID' },
    name: { type: 'string', description: 'Display name of the file' },
    fileName: { type: 'string', description: 'Original file name' },
    type: {
      type: 'string',
      enum: ['resume', 'template', 'backup', 'cover_letter', 'transcript', 'certification', 'reference', 'portfolio', 'work_sample', 'document'],
      description: 'File type category'
    },
    contentType: { type: 'string', description: 'MIME type of the file' },
    size: { type: 'string', description: 'File size (formatted string)' },
    sizeBytes: { type: 'number', description: 'File size in bytes' },
    storagePath: { type: 'string', description: 'Storage path reference' },
    publicUrl: { type: 'string', nullable: true, description: 'Public URL for file access' },
    folderId: { type: 'string', nullable: true, description: 'Parent folder ID' },
    isStarred: { type: 'boolean', description: 'Whether file is starred' },
    isArchived: { type: 'boolean', description: 'Whether file is archived' },
    deletedAt: { type: 'string', format: 'date-time', nullable: true, description: 'Deletion timestamp' },
    createdAt: { type: 'string', format: 'date-time', description: 'Creation timestamp' },
    updatedAt: { type: 'string', format: 'date-time', description: 'Last update timestamp' }
  }
};

const folderSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', description: 'Unique folder identifier' },
    userId: { type: 'string', description: 'Owner user ID' },
    name: { type: 'string', description: 'Folder name' },
    parentId: { type: 'string', nullable: true, description: 'Parent folder ID for nested folders' },
    color: { type: 'string', nullable: true, description: 'Folder color code' },
    createdAt: { type: 'string', format: 'date-time', description: 'Creation timestamp' },
    updatedAt: { type: 'string', format: 'date-time', description: 'Last update timestamp' }
  }
};

const paginationSchema = {
  type: 'object',
  properties: {
    page: { type: 'number', description: 'Current page number' },
    limit: { type: 'number', description: 'Items per page' },
    total: { type: 'number', description: 'Total number of items' },
    totalPages: { type: 'number', description: 'Total number of pages' },
    hasMore: { type: 'boolean', description: 'Whether more pages exist' }
  }
};

const errorSchema = {
  type: 'object',
  properties: {
    success: { type: 'boolean', example: false },
    error: { type: 'string', description: 'Error message' }
  }
};

// GET /files - List files
const listFilesSchema = {
  tags: ['Files'],
  summary: 'List all files for authenticated user',
  description: 'Returns a paginated list of files with optional filtering by folder, type, and status',
  security: [{ Bearer: [] }, { CookieAuth: [] }],
  querystring: {
    type: 'object',
    properties: {
      folderId: { type: 'string', description: 'Filter by folder ID' },
      type: { type: 'string', description: 'Filter by file type' },
      showDeleted: { type: 'boolean', description: 'Include deleted files' },
      showArchived: { type: 'boolean', description: 'Include archived files' },
      page: { type: 'number', default: 1, description: 'Page number' },
      limit: { type: 'number', default: 50, description: 'Items per page' }
    }
  },
  response: {
    200: {
      type: 'object',
      properties: {
        files: { type: 'array', items: fileSchema },
        pagination: paginationSchema
      }
    },
    401: errorSchema,
    500: errorSchema
  }
};

// POST /upload - Upload file
const uploadFileSchema = {
  tags: ['Files'],
  summary: 'Upload a new file',
  description: 'Upload a file with metadata. Supports PDF, DOC, DOCX, TXT, images, and videos (max 50MB for videos, 10MB for others)',
  security: [{ Bearer: [] }, { CookieAuth: [] }],
  consumes: ['multipart/form-data'],
  response: {
    201: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        file: fileSchema
      }
    },
    400: errorSchema,
    401: errorSchema,
    500: errorSchema
  }
};

// GET /files/:id - Get file details
const getFileSchema = {
  tags: ['Files'],
  summary: 'Get file details',
  description: 'Retrieve detailed information about a specific file',
  security: [{ Bearer: [] }, { CookieAuth: [] }],
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string', description: 'File ID' }
    }
  },
  response: {
    200: fileSchema,
    401: errorSchema,
    404: errorSchema,
    500: errorSchema
  }
};

// GET /files/:id/download - Download file
const downloadFileSchema = {
  tags: ['Files'],
  summary: 'Download file',
  description: 'Download file content with proper content-type headers',
  security: [{ Bearer: [] }, { CookieAuth: [] }],
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string', description: 'File ID' }
    }
  },
  response: {
    200: {
      type: 'string',
      format: 'binary',
      description: 'File content'
    },
    401: errorSchema,
    404: errorSchema,
    500: errorSchema
  }
};

// PATCH /files/:id - Update file metadata
const updateFileSchema = {
  tags: ['Files'],
  summary: 'Update file metadata',
  description: 'Update file name, type, folder, starred, or archived status',
  security: [{ Bearer: [] }, { CookieAuth: [] }],
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string', description: 'File ID' }
    }
  },
  body: {
    type: 'object',
    properties: {
      name: { type: 'string', description: 'New display name' },
      type: { type: 'string', description: 'New file type' },
      folderId: { type: 'string', nullable: true, description: 'New folder ID' },
      isStarred: { type: 'boolean', description: 'Star/unstar file' },
      isArchived: { type: 'boolean', description: 'Archive/unarchive file' }
    }
  },
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        file: fileSchema
      }
    },
    400: errorSchema,
    401: errorSchema,
    404: errorSchema,
    500: errorSchema
  }
};

// DELETE /files/:id - Delete file
const deleteFileSchema = {
  tags: ['Files'],
  summary: 'Delete file (soft delete)',
  description: 'Soft delete a file by setting deletedAt timestamp',
  security: [{ Bearer: [] }, { CookieAuth: [] }],
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string', description: 'File ID' }
    }
  },
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string' }
      }
    },
    401: errorSchema,
    404: errorSchema,
    500: errorSchema
  }
};

// POST /files/:id/restore - Restore deleted file
const restoreFileSchema = {
  tags: ['Files'],
  summary: 'Restore deleted file',
  description: 'Restore a soft-deleted file',
  security: [{ Bearer: [] }, { CookieAuth: [] }],
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string', description: 'File ID' }
    }
  },
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        file: fileSchema
      }
    },
    401: errorSchema,
    404: errorSchema,
    500: errorSchema
  }
};

// GET /folders - List folders
const listFoldersSchema = {
  tags: ['Folders'],
  summary: 'List all folders',
  description: 'Returns all folders for the authenticated user, supporting nested folder structures',
  security: [{ Bearer: [] }, { CookieAuth: [] }],
  response: {
    200: {
      type: 'object',
      properties: {
        folders: { type: 'array', items: folderSchema }
      }
    },
    401: errorSchema,
    500: errorSchema
  }
};

// POST /folders - Create folder
const createFolderSchema = {
  tags: ['Folders'],
  summary: 'Create a new folder',
  description: 'Create a folder with optional parent for nested structure',
  security: [{ Bearer: [] }, { CookieAuth: [] }],
  body: {
    type: 'object',
    required: ['name'],
    properties: {
      name: { type: 'string', description: 'Folder name' },
      parentId: { type: 'string', nullable: true, description: 'Parent folder ID for nested folders' },
      color: { type: 'string', nullable: true, description: 'Folder color code (hex)' }
    }
  },
  response: {
    201: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        folder: folderSchema
      }
    },
    400: errorSchema,
    401: errorSchema,
    500: errorSchema
  }
};

// PATCH /folders/:id - Update folder
const updateFolderSchema = {
  tags: ['Folders'],
  summary: 'Update folder metadata',
  description: 'Update folder name, parent, or color',
  security: [{ Bearer: [] }, { CookieAuth: [] }],
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string', description: 'Folder ID' }
    }
  },
  body: {
    type: 'object',
    properties: {
      name: { type: 'string', description: 'New folder name' },
      parentId: { type: 'string', nullable: true, description: 'New parent folder ID' },
      color: { type: 'string', nullable: true, description: 'New folder color' }
    }
  },
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        folder: folderSchema
      }
    },
    400: errorSchema,
    401: errorSchema,
    404: errorSchema,
    500: errorSchema
  }
};

// DELETE /folders/:id - Delete folder
const deleteFolderSchema = {
  tags: ['Folders'],
  summary: 'Delete folder',
  description: 'Delete a folder and move its contents to parent or root',
  security: [{ Bearer: [] }, { CookieAuth: [] }],
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string', description: 'Folder ID' }
    }
  },
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string' }
      }
    },
    401: errorSchema,
    404: errorSchema,
    500: errorSchema
  }
};

// POST /files/batch/delete - Batch delete files
const batchDeleteSchema = {
  tags: ['Batch Operations'],
  summary: 'Batch delete files',
  description: 'Soft delete multiple files at once',
  security: [{ Bearer: [] }, { CookieAuth: [] }],
  body: {
    type: 'object',
    required: ['fileIds'],
    properties: {
      fileIds: {
        type: 'array',
        items: { type: 'string' },
        description: 'Array of file IDs to delete'
      }
    }
  },
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        deletedCount: { type: 'number' }
      }
    },
    400: errorSchema,
    401: errorSchema,
    500: errorSchema
  }
};

// POST /files/batch/move - Batch move files
const batchMoveSchema = {
  tags: ['Batch Operations'],
  summary: 'Batch move files',
  description: 'Move multiple files to a different folder',
  security: [{ Bearer: [] }, { CookieAuth: [] }],
  body: {
    type: 'object',
    required: ['fileIds', 'targetFolderId'],
    properties: {
      fileIds: {
        type: 'array',
        items: { type: 'string' },
        description: 'Array of file IDs to move'
      },
      targetFolderId: {
        type: 'string',
        nullable: true,
        description: 'Target folder ID (null for root)'
      }
    }
  },
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        movedCount: { type: 'number' }
      }
    },
    400: errorSchema,
    401: errorSchema,
    500: errorSchema
  }
};

// POST /files/batch/restore - Batch restore files
const batchRestoreSchema = {
  tags: ['Batch Operations'],
  summary: 'Batch restore files',
  description: 'Restore multiple deleted files at once',
  security: [{ Bearer: [] }, { CookieAuth: [] }],
  body: {
    type: 'object',
    required: ['fileIds'],
    properties: {
      fileIds: {
        type: 'array',
        items: { type: 'string' },
        description: 'Array of file IDs to restore'
      }
    }
  },
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        restoredCount: { type: 'number' }
      }
    },
    400: errorSchema,
    401: errorSchema,
    500: errorSchema
  }
};

// POST /files/download/zip - Download multiple files as ZIP
const downloadZipSchema = {
  tags: ['Batch Operations'],
  summary: 'Download files as ZIP archive',
  description: 'Download multiple files packaged in a ZIP archive',
  security: [{ Bearer: [] }, { CookieAuth: [] }],
  body: {
    type: 'object',
    required: ['fileIds'],
    properties: {
      fileIds: {
        type: 'array',
        items: { type: 'string' },
        description: 'Array of file IDs to include in ZIP'
      },
      archiveName: {
        type: 'string',
        default: 'files.zip',
        description: 'Name for the ZIP archive'
      }
    }
  },
  response: {
    200: {
      type: 'string',
      format: 'binary',
      description: 'ZIP archive file'
    },
    400: errorSchema,
    401: errorSchema,
    404: errorSchema,
    500: errorSchema
  }
};

// GET /analytics - Storage analytics
const analyticsSchema = {
  tags: ['Analytics'],
  summary: 'Get storage analytics',
  description: 'Retrieve comprehensive storage statistics and metrics',
  security: [{ Bearer: [] }, { CookieAuth: [] }],
  response: {
    200: {
      type: 'object',
      properties: {
        totalFiles: { type: 'number', description: 'Total number of files' },
        totalSize: { type: 'number', description: 'Total storage used in bytes' },
        totalSizeFormatted: { type: 'string', description: 'Formatted storage size' },
        filesByType: {
          type: 'object',
          description: 'File count grouped by type'
        },
        recentFiles: {
          type: 'array',
          items: fileSchema,
          description: 'Recently uploaded files'
        },
        starredFiles: {
          type: 'array',
          items: fileSchema,
          description: 'Starred files'
        }
      }
    },
    401: errorSchema,
    500: errorSchema
  }
};

// File Versioning Schemas
const fileVersionSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', description: 'Version ID' },
    fileId: { type: 'string', description: 'Associated file ID' },
    userId: { type: 'string', description: 'User ID' },
    versionNumber: { type: 'number', description: 'Version number (incremental)' },
    fileName: { type: 'string', description: 'File name at this version' },
    contentType: { type: 'string', description: 'MIME type' },
    size: { type: 'number', description: 'File size in bytes' },
    storagePath: { type: 'string', description: 'Storage path' },
    fileHash: { type: 'string', description: 'File content hash' },
    changeDescription: { type: 'string', nullable: true, description: 'Description of changes' },
    isActive: { type: 'boolean', description: 'Whether this is the active version' },
    createdAt: { type: 'string', format: 'date-time', description: 'Creation timestamp' }
  }
};

const createVersionSchema = {
  tags: ['File Versioning'],
  summary: 'Create file version',
  description: 'Create a new version snapshot of a file',
  security: [{ Bearer: [] }, { CookieAuth: [] }],
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string', description: 'File ID' }
    }
  },
  body: {
    type: 'object',
    properties: {
      changeDescription: { type: 'string', description: 'Description of changes in this version' }
    }
  },
  response: {
    201: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        version: fileVersionSchema
      }
    },
    401: errorSchema,
    404: errorSchema,
    500: errorSchema
  }
};

const listVersionsSchema = {
  tags: ['File Versioning'],
  summary: 'List file versions',
  description: 'Get all versions of a specific file',
  security: [{ Bearer: [] }, { CookieAuth: [] }],
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string', description: 'File ID' }
    }
  },
  response: {
    200: {
      type: 'object',
      properties: {
        versions: { type: 'array', items: fileVersionSchema }
      }
    },
    401: errorSchema,
    404: errorSchema,
    500: errorSchema
  }
};

const restoreVersionSchema = {
  tags: ['File Versioning'],
  summary: 'Restore file version',
  description: 'Restore a file to a specific version',
  security: [{ Bearer: [] }, { CookieAuth: [] }],
  params: {
    type: 'object',
    required: ['id', 'versionId'],
    properties: {
      id: { type: 'string', description: 'File ID' },
      versionId: { type: 'string', description: 'Version ID to restore' }
    }
  },
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        file: fileSchema,
        restoredVersion: fileVersionSchema
      }
    },
    401: errorSchema,
    404: errorSchema,
    500: errorSchema
  }
};

// File Tagging Schemas
const fileTagSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', description: 'Tag ID' },
    userId: { type: 'string', nullable: true, description: 'User ID (null for system tags)' },
    name: { type: 'string', description: 'Tag name' },
    color: { type: 'string', nullable: true, description: 'Tag color code' },
    createdAt: { type: 'string', format: 'date-time', description: 'Creation timestamp' },
    updatedAt: { type: 'string', format: 'date-time', description: 'Last update timestamp' }
  }
};

const listTagsSchema = {
  tags: ['File Tagging'],
  summary: 'List all tags',
  description: 'Get all tags for the authenticated user',
  security: [{ Bearer: [] }, { CookieAuth: [] }],
  response: {
    200: {
      type: 'object',
      properties: {
        tags: { type: 'array', items: fileTagSchema }
      }
    },
    401: errorSchema,
    500: errorSchema
  }
};

const createTagSchema = {
  tags: ['File Tagging'],
  summary: 'Create tag',
  description: 'Create a new file tag',
  security: [{ Bearer: [] }, { CookieAuth: [] }],
  body: {
    type: 'object',
    required: ['name'],
    properties: {
      name: { type: 'string', description: 'Tag name' },
      color: { type: 'string', nullable: true, description: 'Tag color (hex code)' }
    }
  },
  response: {
    201: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        tag: fileTagSchema
      }
    },
    400: errorSchema,
    401: errorSchema,
    500: errorSchema
  }
};

const addFileTagSchema = {
  tags: ['File Tagging'],
  summary: 'Add tag to file',
  description: 'Associate a tag with a file',
  security: [{ Bearer: [] }, { CookieAuth: [] }],
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string', description: 'File ID' }
    }
  },
  body: {
    type: 'object',
    required: ['tagId'],
    properties: {
      tagId: { type: 'string', description: 'Tag ID to add' }
    }
  },
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string' }
      }
    },
    400: errorSchema,
    401: errorSchema,
    404: errorSchema,
    500: errorSchema
  }
};

const removeFileTagSchema = {
  tags: ['File Tagging'],
  summary: 'Remove tag from file',
  description: 'Remove a tag association from a file',
  security: [{ Bearer: [] }, { CookieAuth: [] }],
  params: {
    type: 'object',
    required: ['id', 'tagId'],
    properties: {
      id: { type: 'string', description: 'File ID' },
      tagId: { type: 'string', description: 'Tag ID to remove' }
    }
  },
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string' }
      }
    },
    401: errorSchema,
    404: errorSchema,
    500: errorSchema
  }
};

module.exports = {
  // File operations
  listFilesSchema,
  uploadFileSchema,
  getFileSchema,
  downloadFileSchema,
  updateFileSchema,
  deleteFileSchema,
  restoreFileSchema,

  // Folder operations
  listFoldersSchema,
  createFolderSchema,
  updateFolderSchema,
  deleteFolderSchema,

  // Batch operations
  batchDeleteSchema,
  batchMoveSchema,
  batchRestoreSchema,
  downloadZipSchema,

  // Analytics
  analyticsSchema,

  // File versioning
  createVersionSchema,
  listVersionsSchema,
  restoreVersionSchema,

  // File tagging
  listTagsSchema,
  createTagSchema,
  addFileTagSchema,
  removeFileTagSchema
};
