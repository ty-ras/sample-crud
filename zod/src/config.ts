import { configuration } from "@ty-ras-extras/backend-zod";
import * as t from "zod";

export type Config = t.TypeOf<typeof config>;
export type ConfigAuthentication = Config["authentication"];
export type ConfigHTTPServer = Config["http"];

const remoteEndpoint = t.object({
  host: t.string().nonempty(),
  port: t.number().int(),
});

const authConfig = t
  .object({
    // Insert authentication-related properties here
    // E.g. AWS pool ID + client ID + region, AzureAD tenant ID + app ID, etc.
  })
  .describe("AuthConfig");

const config = t
  .object({
    authentication: authConfig,
    http: t
      .object({
        server: t
          .object({
            ...remoteEndpoint.shape,
            // TODO: certs
          })
          .describe("HTTPServerConfig"),
        // Remove this if CORS is not needed
        cors: t
          .object({
            frontendAddress: t.string().nonempty(),
          })
          .describe("HTTPCorsConfig"),
      })
      .describe("HTTPConfig"),
    database: t
      .object({
        // This type has purposefully same property names and types as ClientConfig in 'pg' library.
        connection: t
          .object({
            ...remoteEndpoint.shape,
            database: t.string().nonempty(),
            user: t.string().nonempty(),
            password: t.string().nonempty(),
          })
          .describe("DatabaseConnection"),
        // This type has purposefully same property names and types as resource pool config in TyRAS extras.
        pool: t
          .object({
            minCount: t.number().int(),
            maxCount: t.number().int(),
            retry: t
              .object({
                waitBeforeRetryMs: t.number().int(),
                retryCount: t.number().int(),
              })
              .describe("DatabasePoolRetry"),
            eviction: t
              .object({
                checkPeriodMs: t.number().int(),
                maxIdleTimeMs: t.number().int(),
              })
              .describe("DatabasePoolEviction"),
          })
          .describe("DatabasePool"),
      })
      .describe("Database"),
  })
  .describe("BEConfig");

// Change this name to something more suitable for your application, and then update the 'dev' script in package.json file.
const ENV_VAR_NAME = "MY_BACKEND_CONFIG";
export default configuration.validateFromMaybeStringifiedJSONOrThrow(
  config,
  await configuration.getJSONStringValueFromMaybeStringWhichIsJSONOrFilenameFromEnvVar(
    ENV_VAR_NAME,
    process.env[ENV_VAR_NAME],
  ),
);
