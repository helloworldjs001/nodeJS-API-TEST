const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3000;

// Sample data
const resources = {
    1: { name: "Resource 1", type: "Type A" },
    2: { name: "Resource 2", type: "Type B" }
};

app.use(bodyParser.json());

// GET /resource - Retrieve all resources
app.get('/resource', (req, res) => {
    res.status(200).json(resources);
});

// GET /resource/:resource_id - Retrieve a specific resource by ID
app.get('/resource/:resource_id', (req, res) => {
    const resource = resources[req.params.resource_id];
    if (resource) {
        res.status(200).json(resource);
    } else {
        res.status(404).json({ error: "Resource not found" });
    }
});

// POST /resource - Create a new resource
app.post('/resource', (req, res) => {
    const newResource = req.body;
    const resourceId = Object.keys(resources).length + 1;
    resources[resourceId] = newResource;
    res.status(201).json({ id: resourceId });
});

// PUT /resource/:resource_id - Update an existing resource by ID
app.put('/resource/:resource_id', (req, res) => {
    const resourceId = req.params.resource_id;
    if (resources[resourceId]) {
        resources[resourceId] = req.body;
        res.status(200).json({ message: "Resource updated" });
    } else {
        res.status(404).json({ error: "Resource not found" });
    }
});

// DELETE /resource/:resource_id - Delete a specific resource by ID
app.delete('/resource/:resource_id', (req, res) => {
    const resourceId = req.params.resource_id;
    if (resources[resourceId]) {
        delete resources[resourceId];
        res.status(200).json({ message: "Resource deleted" });
    } else {
        res.status(404).json({ error: "Resource not found" });
    }
});

// GET /secure-resource - Access a secure resource with authorization
app.get('/secure-resource', (req, res) => {
    const authHeader = req.headers['authorization'];
    if (authHeader === "Bearer valid_token") {
        res.status(200).json({ message: "Secure Resource Accessed" });
    } else {
        res.status(401).json({ error: "Unauthorized" });
    }
});

// GET /xml-resource - Retrieve a resource in XML format
app.get('/xml-resource', (req, res) => {
    const xmlResponse = `
        <resource>
            <id>1</id>
            <name>Resource 1</name>
            <type>Type A</type>
        </resource>`;
    res.set('Content-Type', 'application/xml');
    res.status(200).send(xmlResponse);
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
