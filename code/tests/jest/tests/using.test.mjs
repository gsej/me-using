"use strict";

describe('using', () => {
  const baseUrl = 'http://localhost:5200/api';
  const validApiKey = 'apikey';

  it('should return 401 when calling get endpoint without API key', async () => {
    const response = await fetch(`${baseUrl}/using/5bf0a60a-58d9-4136-8b4c-85a82e34fb02`);
    expect(response.status).toBe(401);
  });

  it('should return 401 when calling delete endpoint without API key', async () => {
    const response = await fetch(`${baseUrl}/using/5bf0a60a-58d9-4136-8b4c-85a82e34fb02`, {
      method: 'DELETE'
    });
    expect(response.status).toBe(401);
  });

  it('should return 401 when calling post endpoint without API key', async () => {
    const response = await fetch(`${baseUrl}/using`, {
      method: 'POST',
      body: JSON.stringify({
        date: "2025-04-19T08:00:00Z",
        using: 75.5
      }),
    });
    expect(response.status).toBe(401);
  });

  it('should create and retrieve a using entry', async () => {
    const usingData = {
      date: "2025-04-19T08:00:00Z",
      using: 75.5
    };

    // Create using entry
    const createResponse = await fetch(`${baseUrl}/using`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': validApiKey
      },
      body: JSON.stringify(usingData)
    });

    expect(createResponse.status).toBe(201);
    const location = createResponse.headers.get('Location');
    expect(location).toBeTruthy();

    // Retrieve created entry
    const getResponse = await fetch(location, {
      headers: {
        'X-API-Key': validApiKey
      }
    });

    expect(getResponse.status).toBe(200);
    const retrievedData = await getResponse.json();

    expect(retrievedData.usingId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);

    // Check that the rest of the data matches
    expect({
      date: retrievedData.date,
      using: retrievedData.using
    }).toEqual(usingData);
  });

  it('should create and delete a using entry', async () => {
    const usingData = {
      date: "2025-04-19T08:00:00Z",
      using: 75.5
    };

    // Create using entry
    const createResponse = await fetch(`${baseUrl}/using`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': validApiKey
      },
      body: JSON.stringify(usingData)
    });

    expect(createResponse.status).toBe(201);
    const location = createResponse.headers.get('Location');
    expect(location).toBeTruthy();

    // Delete created entry
    const deleteResponse = await fetch(location, {
      method: 'DELETE',
      headers: {
        'X-API-Key': validApiKey
      }
    });

    expect(deleteResponse.status).toBe(204);

    // Attempt to retrieved deleted entry
    const getResponse = await fetch(location, {
      headers: {
        'X-API-Key': validApiKey
      }
    });

    expect(getResponse.status).toBe(404);
  });
});