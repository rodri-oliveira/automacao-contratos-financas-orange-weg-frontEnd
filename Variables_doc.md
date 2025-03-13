# Variables

Variables store information that you can use in job scripts. Each project can define a maximum of **8,000 variables**. [Learn more](#).

## Security Considerations

Variables can be accidentally exposed in a job log or maliciously sent to a third-party server. The **masked variable** feature can help reduce the risk of accidentally exposing variable values, but it is not a guaranteed method to prevent malicious users from accessing variables.  
**[How can I make my variables more secure?](#)**

## Attributes of Variables

Variables can have several attributes. [Learn more](#).

- **Visibility**: Set the visibility level for the value. Can be **visible**, **masked**, or **masked and hidden**.
- **Flags**:
  - **Protected**: Only exposed to protected branches or protected tags.
  - **Expanded**: Variables with `$` will be treated as the start of a reference to another variable.

## CI/CD Variables  

### Project Variables (16)

| Key                     | Expanded | Value                                             | Environments |
|-------------------------|----------|---------------------------------------------------|--------------|
| `AUTH_TRUST_HOST`       | ✅        | `true`                                           | `prd`        |
| `AUTH_TRUST_HOST`       | ✅        | `true`                                           | `qas`        |
| `AUTH_URL`             | ✅        | `https://automacaofinancas.weg.net/api/auth`     | `prd`        |
| `AUTH_URL`             | ✅        | `https://automacaofinancas-qas.weg.net/api/auth` | `qas`        |
| `DOCKER_IMAGE_NAME`     | ✅        | `automacao-financas-frontend`                    | `All (default)` |
| `JWT_SECRET`           | ✅        | `708f588074f90eed104d070ba02dbdb95215675e4c972c688f37550d88637ff1` | `prd` |
| `JWT_SECRET`           | ✅        | `df4203d9077fcd1375378aa361217a1eb7870407f215bc9150d9476637965c24` | `qas` |
| `K8S_APP_NAME`         | ✅        | `automacao-financas-frontend`                    | `All (default)` |
| `K8S_DISABLE_HEALTHCHECK` | ✅      | `true`                                           | `All (default)` |
| `K8S_DISABLE_METRICS`  | ✅        | `true`                                           | `All (default)` |
| `K8S_NAMESPACE`        | ✅        | `prd-automacaofinancas-tin`                      | `prd` |
| `K8S_NAMESPACE`        | ✅        | `qas-automacaofinancas-tin`                      | `qas` |
| `OAUTH_CLIENT_ID`      | ✅        | `0f6c3ac0-a520-44ac-87a5-13ef5cb863e8`           | `qas` |
| `OAUTH_CLIENT_SECRET`  | ✅        | `GxhZT8p2Vt0b7C0Q22uObeK8jWEoQv4E`               | `qas` |
| `OAUTH_ISSUER`        | ✅        | `https://auth.weg.net/realms/WEG`               | `prd` |
| `OAUTH_ISSUER`        | ✅        | `https://auth-qa.weg.net/realms/WEG`            | `qas` |

## Group Variables (Inherited)  

These variables are inherited from the parent group.

### CI/CD Group Variables (5)

| Key            | Environments | Group                        |
|---------------|--------------|-----------------------------|
| `rke2_qas_op` | `All (default)` | `TIN` |
| `rke2_prd_op` | `All (default)` | `TIN` |
| `k8s_lab_op`  | `All (default)` | `TIN` |
| `k8s_prd_op`  | `All (default)` | Migrated to `rke2-prd-op` |
| `k8s_dev_op`  | `All (default)` | Migrated to `rke2-qas-op` |

