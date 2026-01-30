import { preferNamedReactImports } from '../../src/rules/prefer-named-react-imports';
import { createRuleTester } from '../test-utils';

const ruleTester = createRuleTester({
  ecmaFeatures: { jsx: true },
});

ruleTester.run('prefer-named-react-imports', preferNamedReactImports, {
  valid: [
    // Named imports are fine
    {
      code: `import { Fragment } from 'react';
const x = <Fragment>content</Fragment>;`,
    },
    {
      code: `import { useState } from 'react';
const [x, setX] = useState(0);`,
    },
    {
      code: `import { memo } from 'react';
const Component = memo(() => <div />);`,
    },
    // Combined import with named imports is fine when using named imports
    {
      code: `import React, { Fragment, useState } from 'react';
const [x, setX] = useState(0);
const y = <Fragment>content</Fragment>;`,
    },
    // Non-React member access is fine
    {
      code: `import Something from 'something';
Something.Fragment;`,
    },
    // Unknown React exports are fine (might be from React namespace)
    {
      code: `import React from 'react';
React.someUnknownThing();`,
    },
  ],

  invalid: [
    // React.Fragment in JSX - opening tag
    {
      code: `import React from 'react';
const x = <React.Fragment>content</React.Fragment>;`,
      errors: [
        { messageId: 'preferNamedImport', data: { name: 'Fragment' } },
        { messageId: 'preferNamedImport', data: { name: 'Fragment' } },
      ],
      output: `import React, { Fragment } from 'react';
const x = <Fragment>content</Fragment>;`,
    },
    // React.useState
    {
      code: `import React from 'react';
const [x, setX] = React.useState(0);`,
      errors: [{ messageId: 'preferNamedImport', data: { name: 'useState' } }],
      output: `import React, { useState } from 'react';
const [x, setX] = useState(0);`,
    },
    // React.memo
    {
      code: `import React from 'react';
const Component = React.memo(() => <div />);`,
      errors: [{ messageId: 'preferNamedImport', data: { name: 'memo' } }],
      output: `import React, { memo } from 'react';
const Component = memo(() => <div />);`,
    },
    // React.forwardRef
    {
      code: `import React from 'react';
const Component = React.forwardRef((props, ref) => <div ref={ref} />);`,
      errors: [
        { messageId: 'preferNamedImport', data: { name: 'forwardRef' } },
      ],
      output: `import React, { forwardRef } from 'react';
const Component = forwardRef((props, ref) => <div ref={ref} />);`,
    },
    // Multiple hooks - both added to imports
    {
      code: `import React from 'react';
const [x, setX] = React.useState(0);
React.useEffect(() => {}, []);`,
      errors: [
        { messageId: 'preferNamedImport', data: { name: 'useState' } },
        { messageId: 'preferNamedImport', data: { name: 'useEffect' } },
      ],
      output: `import React, { useEffect, useState } from 'react';
const [x, setX] = useState(0);
useEffect(() => {}, []);`,
    },
    // Already has some named imports - adds missing one
    {
      code: `import React, { useState } from 'react';
const x = <React.Fragment>content</React.Fragment>;`,
      errors: [
        { messageId: 'preferNamedImport', data: { name: 'Fragment' } },
        { messageId: 'preferNamedImport', data: { name: 'Fragment' } },
      ],
      output: `import React, { useState, Fragment } from 'react';
const x = <Fragment>content</Fragment>;`,
    },
  ],
});
