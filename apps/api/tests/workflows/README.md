# Workflow System Tests

Comprehensive test suite for the workflow automation system.

## Test Coverage

### Backend Tests

#### `workflowService.test.js`
Unit tests for workflow service business logic:
- ✅ Workflow CRUD operations (create, read, update, delete)
- ✅ Workflow execution and cancellation
- ✅ Template management
- ✅ Node metadata retrieval
- ✅ Node testing functionality
- ✅ Error handling and validation
- ✅ Permission checks and security

#### `workflowRoutes.test.js`
Integration tests for workflow API endpoints:
- ✅ All workflow REST API endpoints
- ✅ Request validation
- ✅ Response formatting
- ✅ Error responses
- ✅ Authentication handling
- ✅ Query parameter processing

### Frontend Tests

#### `useWorkflowApi.test.tsx`
Unit tests for workflow API hook:
- ✅ Workflow data fetching
- ✅ Workflow creation and updates
- ✅ Workflow execution
- ✅ Template loading
- ✅ Statistics retrieval
- ✅ Error handling
- ✅ Loading states

#### `useWorkflowHistory.test.tsx`
Unit tests for undo/redo functionality:
- ✅ History initialization
- ✅ State saving to history
- ✅ Undo operations
- ✅ Redo operations
- ✅ History limits
- ✅ History navigation
- ✅ History cleanup

#### `TemplateVariableInput.test.tsx`
Component tests for autocomplete input:
- ✅ Input rendering and value display
- ✅ Suggestion filtering
- ✅ Keyboard navigation
- ✅ Suggestion selection
- ✅ Focus/blur behavior
- ✅ Custom suggestions support

## Running Tests

### Backend Tests

```bash
# From project root
cd apps/api

# Run all tests
npm test

# Run specific test file
npm test workflowService.test.js

# Run with coverage
npm test -- --coverage

# Run in watch mode
npm test -- --watch
```

### Frontend Tests

```bash
# From project root
cd apps/web

# Run all tests
npm test

# Run workflow-related tests
npm test -- --testPathPattern=Workflow

# Run with coverage
npm test -- --coverage

# Run in watch mode
npm test -- --watch
```

### Run All Tests

```bash
# From project root
npm test
```

## Test Structure

```
apps/
├── api/
│   └── tests/
│       ├── workflowService.test.js      # Service unit tests
│       └── workflowRoutes.test.js       # Route integration tests
└── web/
    └── src/
        ├── hooks/
        │   └── __tests__/
        │       ├── useWorkflowApi.test.tsx       # API hook tests
        │       └── useWorkflowHistory.test.tsx   # History hook tests
        └── components/
            └── WorkflowBuilder/
                └── __tests__/
                    └── TemplateVariableInput.test.tsx  # Component tests
```

## Mocking Strategy

### Backend
- Prisma Client mocked for database operations
- WorkflowExecutor mocked for execution logic
- NodeRegistry mocked for node metadata
- Logger mocked to avoid console spam

### Frontend
- `fetch` mocked for API calls
- React Flow components mocked where needed
- User events simulated with `@testing-library/user-event`

## Coverage Goals

- **Line Coverage**: >80%
- **Branch Coverage**: >75%
- **Function Coverage**: >85%
- **Statement Coverage**: >80%

## Key Test Scenarios

### Workflow Creation
- Valid workflow creation
- Missing required fields
- Invalid trigger types
- Template workflows

### Workflow Execution
- Successful execution
- Concurrent execution limits
- Inactive workflow execution
- Input validation

### Node Testing
- Successful node execution
- Node type validation
- Error handling
- Custom input processing

### History Management
- Save to history
- Undo/redo operations
- History size limits
- State isolation

### Autocomplete
- Suggestion filtering
- Keyboard navigation
- Selection handling
- Custom suggestions

## Continuous Integration

Tests run automatically on:
- Pull request creation
- Commits to main branch
- Pre-deployment checks

## Troubleshooting

### Tests Failing Locally

1. Clear Jest cache:
   ```bash
   npm test -- --clearCache
   ```

2. Update snapshots (if applicable):
   ```bash
   npm test -- -u
   ```

3. Check Node version compatibility (requires Node 18+)

### Timeout Errors

Increase timeout for long-running tests:
```javascript
jest.setTimeout(10000); // 10 seconds
```

### Mock Issues

Ensure mocks are cleared between tests:
```javascript
beforeEach(() => {
  jest.clearAllMocks();
});
```

## Contributing

When adding new workflow features:
1. Write tests first (TDD approach)
2. Ensure >80% coverage for new code
3. Update this README with new test files
4. Run full test suite before committing
