import swaggerJsDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";
import dotenv from "dotenv";

dotenv.config();

const PORT: string = process.env.PORT || "3000";
const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Daddy-EMS API",
            version: "1.0.0",
            description: "API documentation for Daddy-EMS",
        },
        servers: [
            {
                url: `http://localhost:${PORT}`,
                description: "Local server",
            },
        ],
        tags: [
            {
                name: "UserAuth",
                description: "User Authentication Routes",
            },
            {
                name: "AdminAuth",
                description: "Admin Authentication Routes",
            },
            {
                name: "User",
                description: "User Routes"
            },
            {
                name: "Event",
                description: "Event Registration"
            },
            {
                name: "Admin",
                description: "Club Admin routes"
            },
            {
                name: "GlobalAdmin",
                description: "Global Admin routes"
            },
            {
                name: "Club",
                description: "Club Routes"
            }
        ]
    },
    apis: [
        "./src/api/auth/userAuth/*.ts",
        "./src/api/auth/adminAuth/*.ts",
        "./src/api/user/*.ts",
        "./src/api/event/*.ts",
        "./src/api/admin/*.ts",
        "./src/api/auth/globalAuth/*.ts",
        "./src/api/global/*.ts",
        "./src/api/club/*.ts",
    ], // Update this if you have more routes
};

const swaggerSpec = swaggerJsDoc(options);

export function setupSwagger(app: Express) {
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
