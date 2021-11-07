const ENV_VARS = [
    "API_PORT",
    "AUTH_SECRET",
] as const;

const env: Record<typeof ENV_VARS[number], string> = ENV_VARS.reduce((acc, key) => {
    if (process.env[key] === undefined) {
        throw new Error(`Env var ${key} is not set`);
    }

    acc[key] = process.env[key] as string;
    
    return acc;
}, {} as Record<typeof ENV_VARS[number], string>);

export default env;