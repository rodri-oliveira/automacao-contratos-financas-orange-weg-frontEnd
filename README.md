This is a [Next.js](https://nextjs.com/) project bootstrapped with [Developers Portal](https://developers-portal.weg.net/).

## Getting Started

First, to run in development you may need to create a `.env.development` file in the root of the project.

This `.env.development` file should contain the given variables:

|Name|Description|Example|
|-|-|-|
|AUTH_KEYCLOAK_ID|The [client_id](https://www.oauth.com/oauth2-servers/client-registration/client-id-secret/) for the given application|`app_client_id`|
|AUTH_KEYCLOAK_SECRET|The [client_secret](https://www.oauth.com/oauth2-servers/client-registration/client-id-secret/) for the given application|`app_client_secret`|
|AUTH_SECRET|A random hash that will be used as a key to encrypt auth info inside the server|`i$Q1"P"16"gY]_8jyu}5`|
|AUTH_KEYCLOAK_ISSUER|The [iss](https://datatracker.ietf.org/doc/html/rfc7519#section-4.1.1) value that will be asserted|`https://auth-qa.weg.net`|


run the development server:

```bash
npm run dev
```

Access [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Learn More

To leare more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.