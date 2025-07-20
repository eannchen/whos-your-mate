export const loadConfig = async () => {
    const exampleConfig = await import('./config.example.js');

    try {
        const userConfig = await import('./config.js');
        return { ...exampleConfig, ...userConfig };
    } catch (err) {
        console.warn("config.js not found, using default config.example.js");
        return exampleConfig;
    }
};