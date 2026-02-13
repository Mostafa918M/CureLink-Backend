const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'CureLink API Documentation',
            version: '1.0.0',
            description: 'API documentation for the CureLink project',
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Development server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
    },
    // Path to the API docs
    apis: [
        './routes/*.js',
        './controllers/*.js',
        './docs/swagger/*.js'
    ],
};

const specs = swaggerJsdoc(options);

module.exports = {
    swaggerUi,
    specs,
};
