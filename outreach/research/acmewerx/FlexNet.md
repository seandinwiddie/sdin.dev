# FlexNet JSX Framework

## Summary

FlexNet JSX is a functional JavaScript implementation designed for building modern web applications without dependencies on traditional frameworks. It implements the JSX Framework Persistent Memory Protocol to create lightweight, browser-native web applications that can run locally without a webserver. The framework follows strict functional programming principles, avoiding traditional object-oriented patterns in favor of immutable state management and function composition.

Created by Dr. Robert Whetsel and the FlexNet Development Team from AcmeWerx and CryptoVersus.io, the framework represents a pure functional approach to web development.

The `local-jsx` project serves as a template and demonstration of how to build web applications using the FlexNet JSX ecosystem, showcasing its core principles and functional patterns.

## Technical Explanation

### Core Architecture

FlexNet JSX is built on several key architectural components:

1. **Pure Functional Core Architecture**
   - Treats functions as primary building blocks
   - Leverages immutable data structures
   - Implements functional composition patterns

2. **Type System**
   - Implements monadic types (Maybe, Either, Result)
   - Provides runtime type safety without TypeScript/Flow
   - Handles potentially undefined values safely

3. **Effect System**
   - Isolates side effects from pure functions
   - Provides automatic cleanup mechanisms
   - Manages lifecycle events functionally

4. **State Management**
   - Uses immutable update patterns
   - Implements functional state transitions
   - Avoids shared mutable state

5. **Router System**
   - Functional guards for route access
   - Declarative routing definitions
   - History state management

6. **Property-Based Testing Framework**
   - Systematic test generation
   - Formal verification approaches
   - Pure function testing

### Core Principles

The framework follows these strict principles:

- **Functions as Primary Operations**: Everything is structured as functions rather than objects or classes
- **Immutable State Management**: State is never mutated directly but transformed through pure functions
- **Functional Composition**: Complex operations are composed from simpler functions
- **Zero Dependencies**: No external libraries or frameworks required
- **Browser Native Implementation**: Uses only what's available in modern browsers
- **No Webserver Required**: Applications can run directly from the filesystem

### Key Functional Patterns

FlexNet JSX implements several advanced functional programming patterns:

```javascript
// Functional Composition Utilities
const compose = (...fns) => x => fns.reduceRight((acc, fn) => fn(acc), x);
const pipe = (...fns) => x => fns.reduce((acc, fn) => fn(acc), x);
const curry = fn => (...args) => 
  args.length >= fn.length 
    ? fn(...args) 
    : (...more) => curry(fn)(...args, ...more);

// Maybe Monad for handling potentially undefined values
const Maybe = value => ({
  value,
  isNothing: value === null || value === undefined,
  map: fn => Maybe(value).isNothing ? Maybe(null) : Maybe(fn(value)),
  orElse: defaultValue => Maybe(value).isNothing ? defaultValue : value,
  chain: fn => Maybe(value).isNothing ? Maybe(null) : fn(value)
});

// Either Monad for error handling
const Either = {
  Left: value => ({
    isLeft: true,
    isRight: false,
    value,
    map: _ => Either.Left(value),
    mapLeft: fn => Either.Left(fn(value)),
    fold: (leftFn, _) => leftFn(value)
  }),
  Right: value => ({
    isLeft: false,
    isRight: true,
    value,
    map: fn => Either.Right(fn(value)),
    mapLeft: _ => Either.Right(value),
    fold: (_, rightFn) => rightFn(value)
  })
};

// Task Monad for async operations
const Task = executor => ({
  run: callback => executor(callback),
  map: fn => Task(cb => executor(x => cb(fn(x)))),
  chain: fn => Task(cb => executor(x => fn(x).run(cb)))
});
```

## How to Use FlexNet JSX

### Installation and Setup

The framework uses a controlled installation process that ensures proper setup:

1. **Official Method** - Include the framework directly in your HTML:
   ```html
   <script type="module" src="path/to/jsx/src/index.js"></script>
   ```

2. **Development Template** - Clone the local-jsx repository:
   ```bash
   git clone https://github.com/OGH3X/local-jsx.git my-project
   ```

3. Navigate to your project directory:
   ```bash
   cd my-project
   ```

4. Open `index.html` in your browser to run the application.

The installation process handles:
- Directory structure verification
- Permission setting
- Installation validation
- Error handling procedures

No build process, bundlers, or development servers are required. The application runs directly in the browser using HTML, CSS, and JavaScript.

### Framework Directory Structure

The complete FlexNet JSX framework has a comprehensive directory structure:

```
.
├── src/
│   ├── core/
│   │   ├── build/          # Build system
│   │   ├── runtime/        # Runtime implementation
│   │   ├── types/          # Type system
│   │   └── functions/      # Core functions
│   │
│   ├── systems/            # System implementations
│   │   ├── render/         # Rendering system
│   │   ├── state/          # State management
│   │   ├── effects/        # Effect handling
│   │   └── events/         # Event system
│   │
│   └── utils/              # Utility functions
│
├── __tests__/              # Test suite
│   ├── core/               # Core tests
│   ├── systems/            # System tests
│   └── features/           # Feature tests
│
├── examples/               # Example code
│   ├── basic/              # Basic examples
│   └── advanced/           # Advanced examples
│
└── docs/                   # Documentation
    ├── ARCHITECTUREOVERVIEW.md
    ├── api-reference.md
    └── getting-started-guide.md
```

### Project Structure (Application Template)

A basic FlexNet JSX application project has this structure:

```
.
├── index.html      # Main HTML file with component structure
├── public/
│   ├── main.css    # Styling
│   ├── main.js     # JavaScript runtime with functional components
│   └── images/     # Image assets
└── privacy.html    # Terms of service (optional)
```

### Creating Components

Components in FlexNet JSX are created using the `createComponent` factory function:

```javascript
// Component Creation Factory
const createComponent = (name, initialState = {}) => {
  // State container (closure)
  let state = Object.freeze(initialState);
  
  // Component registry
  const elements = new Map();
  const effects = [];
  
  // Pure state update
  const updateState = newPartialState => {
    state = Object.freeze({ ...state, ...newPartialState });
    return state;
  };
  
  // Register elements by name
  const registerElement = (elementName, domElement) => {
    if (domElement) {
      elements.set(elementName, domElement);
    }
    return domElement;
  };
  
  // Get registered element 
  const getElement = elementName => elements.get(elementName);
  
  // Register effect
  const registerEffect = effect => {
    effects.push(effect);
    return effect;
  };
  
  // Initialize component
  const init = () => {
    // Find component in DOM
    const componentElement = select(`[data-component="${name}"]`);
    if (!componentElement) return null;
    
    // Find and register all elements
    selectAll(`[data-component="${name}"] [data-element]`).forEach(element => {
      const elementName = element.getAttribute('data-element');
      registerElement(elementName, element);
    });
    
    return {
      element: componentElement,
      getState: () => state,
      updateState,
      getElement,
      dispose: () => {
        effects.forEach(effect => {
          if (typeof effect.dispose === 'function') {
            effect.dispose();
          }
        });
        elements.clear();
        effects.length = 0;
      }
    };
  };
  
  return {
    init,
    registerElement,
    registerEffect,
    getState: () => state,
    updateState
  };
};
```

To create and use a component:

1. Define your component in HTML using data attributes:
   ```html
   <div data-component="counter">
     <button data-element="decrementButton">-</button>
     <span data-element="display">0</span>
     <button data-element="incrementButton">+</button>
   </div>
   ```

2. Initialize the component in JavaScript:
   ```javascript
   const Counter = createComponent('counter', { count: 0 });
   
   const counterInstance = Counter.init();
   if (counterInstance) {
     const { getElement, updateState, getState } = counterInstance;
     
     // Get DOM elements
     const decrementButton = getElement('decrementButton');
     const incrementButton = getElement('incrementButton');
     const display = getElement('display');
     
     // Update display
     const updateDisplay = () => {
       display.textContent = getState().count;
     };
     
     // Register event handlers
     decrementButton.addEventListener('click', () => {
       updateState({ count: getState().count - 1 });
       updateDisplay();
     });
     
     incrementButton.addEventListener('click', () => {
       updateState({ count: getState().count + 1 });
       updateDisplay();
     });
     
     // Initial render
     updateDisplay();
   }
   ```

### Managing Effects

FlexNet JSX provides an effect system to handle side effects with proper cleanup:

```javascript
const createEffect = effect => {
  let cleanup = null;
  
  const run = () => {
    if (cleanup) cleanup();
    cleanup = effect();
    return cleanup;
  };
  
  const dispose = () => {
    if (cleanup) cleanup();
    cleanup = null;
  };
  
  return {
    run,
    dispose
  };
};
```

Example usage:

```javascript
// Create an effect for an interval
const timerEffect = createEffect(() => {
  const timer = setInterval(() => {
    console.log('Tick');
  }, 1000);
  
  // Return cleanup function
  return () => clearInterval(timer);
});

// Register effect with component
const Timer = createComponent('timer');
Timer.registerEffect(timerEffect);

// Initialize and run
const timerInstance = Timer.init();
if (timerInstance) {
  timerEffect.run();
}

// Later, when component is no longer needed
timerInstance.dispose(); // Automatically cleans up all effects
```

### Working with State Functionally

State updates should be performed functionally:

```javascript
// Bad - direct mutation
const badUpdate = () => {
  state.count++;  // Avoid this!
};

// Good - functional update with immutability
const goodUpdate = () => {
  updateState({ count: getState().count + 1 });
};

// Better - using functional composition
const increment = n => n + 1;
const updateCount = compose(
  getState,
  state => state.count,
  increment,
  count => updateState({ count })
);
```

### Technical Standards

FlexNet JSX adheres to strict technical standards:

1. **Script Safety**
   - Error trapping and handling
   - Variable quoting for security
   - Permission handling
   - Cleanup procedures
   - File integrity verification

2. **State Management**
   - Context preservation
   - File system management
   - Implementation rules
   - Technical focus

3. **Browser Support**
   - Chrome (latest)
   - Firefox (latest)
   - Safari (latest)
   - Edge (latest)

### Best Practices

1. **Keep Components Small and Focused**
   - Each component should have a single responsibility
   - Compose larger features from smaller components

2. **Use Functional Composition**
   - Build complex operations by composing simpler functions
   - Use `pipe` and `compose` to create readable data flows

3. **Isolate Side Effects**
   - Keep side effects separate from pure functions
   - Always provide cleanup functions for effects

4. **Leverage Monadic Types**
   - Use `Maybe` for potentially undefined values
   - Use `Either` for operations that may fail
   - Use `Task` for asynchronous operations

5. **Avoid Patterns Discouraged by the Framework**
   - Classes
   - Objects for state
   - `this` keyword
   - Prototypal inheritance
   - Mutable state
   - Imperative loops

## Relationship to the Broader FlexNet Ecosystem

The FlexNet JSX ecosystem consists of several related components:

- **FlexNet JSX**: The complete functional JavaScript runtime and framework
- **local-jsx**: Front-end implementation for applications running locally ([GitHub](https://github.com/OGH3X/local-jsx))
- **web-jsx**: Front-end implementation for web server deployment
- **jsx-javascript-runtime**: Core runtime environment
- **FlexNet JSX Utilities**: Additional functional utilities
- **flexnet-jsx-docs**: Official documentation and reference ([GitHub](https://github.com/OGH3X/flexnet-jsx-docs))

## Documentation

Comprehensive documentation is available in the FlexNet JSX Docs repository:

- **Architecture Overview**: Core design principles and architectural decisions
- **API Reference**: Detailed API documentation
- **Getting Started Guide**: Quick start instructions
- **HTTP System**: Network and request handling
- **Security Practices**: Security implementation details
- **Consistency Analysis**: Framework consistency verification
- **Contribution Guidelines**: How to contribute to the project

## Version Information

- Version: 1.0.0
- Architecture Version: 1.0.0
- Protocol Version: 1.0.0
- Last Updated: 2025-01-31

## Conclusion

FlexNet JSX offers a lightweight, functional approach to web development that emphasizes simplicity, immutability, and composition. By following the patterns and practices outlined in this guide, you can build robust web applications without the overhead of traditional frameworks.

The framework's focus on functional programming principles helps create maintainable, testable code while running directly in the browser without complex build tools or development environments.

## Sources
- [GitHub - OGH3X/local-jsx](https://github.com/OGH3X/local-jsx)
- [GitHub - OGH3X/flexnet-jsx-docs](https://github.com/OGH3X/flexnet-jsx-docs)