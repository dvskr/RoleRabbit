/**
 * Base Node
 * Base class for all workflow nodes
 */

class BaseNode {
  constructor(type, subtype = null) {
    this.type = type;
    this.subtype = subtype;
  }

  /**
   * Execute the node
   * @param {object} node - Node configuration
   * @param {any} input - Input data
   * @param {object} context - Execution context
   * @returns {Promise<any>} - Node output
   */
  async execute(node, input, context) {
    throw new Error('execute() must be implemented by subclass');
  }

  /**
   * Get node metadata for UI
   */
  getMetadata() {
    return {
      type: this.type,
      subtype: this.subtype,
      name: 'Base Node',
      description: 'Base node class',
      icon: 'box',
      color: '#6b7280',
      inputs: [],
      outputs: [],
      config: []
    };
  }

  /**
   * Validate node configuration
   */
  validate(node) {
    return { valid: true, errors: [] };
  }

  /**
   * Get value from input using path
   */
  getValue(input, path, defaultValue = null) {
    if (!path) return input;

    const keys = path.split('.');
    let value = input;

    for (const key of keys) {
      if (value === null || value === undefined) {
        return defaultValue;
      }
      value = value[key];
    }

    return value !== undefined ? value : defaultValue;
  }

  /**
   * Set value in output using path
   */
  setValue(output, path, value) {
    if (!path) return value;

    const keys = path.split('.');
    const lastKey = keys.pop();
    let current = output;

    for (const key of keys) {
      if (!current[key]) {
        current[key] = {};
      }
      current = current[key];
    }

    current[lastKey] = value;
    return output;
  }

  /**
   * Resolve template variables in string
   * Example: "Hello {{user.name}}" -> "Hello John"
   */
  resolveTemplate(template, data, context) {
    if (typeof template !== 'string') return template;

    return template.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
      path = path.trim();

      // Check context variables first
      if (path.startsWith('$')) {
        const varName = path.slice(1);
        return context.variables[varName] || '';
      }

      // Then check input data
      return this.getValue(data, path, '');
    });
  }

  /**
   * Log message
   */
  log(level, message, data = {}) {
    console.log(`[${level.toUpperCase()}] ${message}`, data);
  }
}

module.exports = BaseNode;
