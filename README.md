# @roastery/terroir

Layered exception hierarchy and runtime schema validation for the [Roastery CMS](https://github.com/roastery-cms) ecosystem.

[![Checked with Biome](https://img.shields.io/badge/Checked_with-Biome-60a5fa?style=flat&logo=biome)](https://biomejs.dev)

## Overview

**terroir** provides two core primitives for building robust, type-safe TypeScript applications:

- **Exception hierarchy** — A structured, symbol-tagged exception system organized by architectural layer (Domain, Application, Infrastructure), designed for Clean Architecture and DDD applications.
- **Schema validation** — A runtime validation and coercion engine built on [TypeBox](https://github.com/sinclairzx81/typebox), with support for custom string formats like UUID v7, slug, email, and more.

## Technologies

| Tool | Purpose |
|------|---------|
| [TypeBox](https://github.com/sinclairzx81/typebox) | Runtime schema validation and TypeScript type inference |
| [uuid](https://github.com/uuidjs/uuid) | UUID v7 format validation |
| [tsup](https://tsup.egoist.dev) | Bundling to ESM + CJS with `.d.ts` generation |
| [Bun](https://bun.sh) | Runtime, test runner, and package manager |
| [Knip](https://knip.dev) | Unused exports and dependency detection |
| [Husky](https://typicode.github.io/husky) + [commitlint](https://commitlint.js.org) | Git hooks and conventional commit enforcement |

## Installation

```bash
bun add @roastery/terroir
```

**Peer dependencies** (install alongside):

```bash
bun add @sinclair/typebox uuid
```

---

## Exceptions

All exceptions extend `CoreException` and carry a Symbol-tagged `[ExceptionLayer]` property for runtime layer detection.

```typescript
import { ExceptionLayer } from '@roastery/terroir/exceptions/symbols';

function handleError(err: unknown) {
  if (err instanceof Error && ExceptionLayer in err) {
    const layer = (err as any)[ExceptionLayer]; // 'application' | 'domain' | 'infra' | 'internal'
    console.log(`Error from layer: ${layer}`);
  }
}
```

### Application layer

Errors related to business logic, request handling, and user input.

```typescript
import { BadRequestException } from '@roastery/terroir/exceptions/application';

throw new BadRequestException('Invalid input', 'UserController');
```

| Class | When to use |
|-------|-------------|
| `BadRequestException` | Invalid or malformed input |
| `UnauthorizedException` | Authentication required or failed |
| `InvalidOperationException` | Operation not allowed in current state |
| `ResourceNotFoundException` | Requested resource does not exist |
| `ResourceAlreadyExistsException` | Duplicate resource creation attempt |
| `InvalidJwtException` | JWT token is invalid |
| `UnableToSignPayloadException` | JWT signing failed |

### Domain layer

Errors from domain model constraint violations.

```typescript
import { InvalidPropertyException } from '@roastery/terroir/exceptions/domain';

throw new InvalidPropertyException('email', 'UserEntity');
```

| Class | When to use |
|-------|-------------|
| `InvalidDomainDataException` | Domain invariant violated |
| `InvalidPropertyException` | Entity property failed validation |
| `OperationFailedException` | Domain operation could not complete |

### Infrastructure layer

Errors from external services and I/O operations.

```typescript
import { DatabaseUnavailableException } from '@roastery/terroir/exceptions/infra';

throw new DatabaseUnavailableException('PostgresRepository');
```

| Class | When to use |
|-------|-------------|
| `DatabaseUnavailableException` | Database connection failed |
| `CacheUnavailableException` | Cache service unreachable |
| `UnexpectedCacheValueException` | Cache returned unexpected data |
| `ConflictException` | Unique constraint violation |
| `ForeignDependencyConstraintException` | Foreign key constraint violation |
| `ResourceNotFoundException` | Record not found in data store |
| `OperationNotAllowedException` | Operation rejected by data store |
| `InvalidEnvironmentException` | Missing or invalid environment config |
| `MissingPluginDependencyException` | Required plugin not registered |

### Internal exceptions

Rarely used directly — reserved for framework-level error handling.

```typescript
import { UnknownException, InvalidEntityData, InvalidObjectValueException } from '@roastery/terroir/exceptions';
```

### Base classes and type utilities

```typescript
// Extend these to create your own layer-specific exceptions
import { ApplicationException, DomainException, InfraException } from '@roastery/terroir/exceptions/models';

// Type utilities for mapping exception constructors by layer
import type { RoasteryExceptionKeysByLayer, RoasteryExceptionKeys, RoasteryExceptionRecords } from '@roastery/terroir/exceptions/types';
```

---

## Schema Validation

```typescript
import { Schema } from '@roastery/terroir/schema';
import { Type } from '@sinclair/typebox';

// Importing the schema module also registers all custom formats
const UserSchema = new Schema(
  Type.Object({
    id: Type.String({ format: 'uuid' }),
    email: Type.String({ format: 'email' }),
    slug: Type.String({ format: 'slug' }),
    createdAt: Type.String({ format: 'date-time' }),
  })
);

// Validate input
if (UserSchema.match(data)) {
  // data is typed as Static<typeof UserSchema>
}

// Coerce and clean input (removes extra properties, applies defaults)
const user = UserSchema.map(rawInput);

// Serialize schema to JSON string
const json = UserSchema.toString();
```

### Dynamic schema loading

Load and compile schemas at runtime from JSON strings (e.g., from a database or config file):

```typescript
import { SchemaManager } from '@roastery/terroir/schema';
import type { TObject } from '@sinclair/typebox';

const schema = SchemaManager.build<TObject>('{"type":"object","properties":{...}}');

SchemaManager.isSchema(unknownValue); // boolean
```

### Available string formats

Automatically registered when importing `@roastery/terroir/schema`:

| Format | Description |
|--------|-------------|
| `uuid` | UUID v7 |
| `email` | Email address (RFC 5322) |
| `url` | Full URL with valid hostname |
| `simple-url` | Basic URL (no hostname requirement) |
| `slug` | URL slug (`kebab-case-only`) |
| `date-time` | ISO 8601 date-time string |
| `json` | Valid JSON string |

---

## Exports reference

```typescript
import { t, uuid } from '@roastery/terroir';                    // TypeBox and uuid namespaces (re-exports)
import { ... } from '@roastery/terroir/exceptions';             // internal exceptions (rare)
import { ... } from '@roastery/terroir/exceptions/application'; // application layer
import { ... } from '@roastery/terroir/exceptions/application/jwt'; // JWT exceptions
import { ... } from '@roastery/terroir/exceptions/domain';      // domain layer
import { ... } from '@roastery/terroir/exceptions/infra';       // infra layer
import { ... } from '@roastery/terroir/exceptions/models';      // base classes
import { ... } from '@roastery/terroir/exceptions/symbols';     // ExceptionLayer symbol
import type { ... } from '@roastery/terroir/exceptions/types';  // type utilities
import { ... } from '@roastery/terroir/schema';                 // Schema + SchemaManager
```

### Re-exports

`t` and `uuid` are re-exported for convenience, so you don't need to import them separately:

```typescript
import { t, uuid } from '@roastery/terroir';

const UserSchema = t.Object({
  id: t.String({ format: 'uuid' }),
  name: t.String(),
});

const id = uuid.v7();
```

---

## Development

```bash
# Run tests
bun run test:unit

# Run tests with coverage
bun run test:coverage

# Build for distribution
bun run build

# Check for unused exports and dependencies
bun run knip

# Full setup (build + bun link)
bun run setup
```

## License

MIT
