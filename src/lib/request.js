const runRequest = async ({ method, path, body }) => {
  return await fetch(path, {
    method: method,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
};

const request = {
  json: async (params) => {
    const response = await runRequest(params);
    if (response.status > 200) {
      const error = new Error(
        `Request failed with status code: ${response.status}`
      );
      error.code = response.status;
      throw error;
    }
    try {
      return await response.json();
    } catch (err) {
      return;
    }
  },
  text: async (params) => {
    const response = await runRequest(params);
    if (response.status > 200) {
      const error = new Error(
        `Request failed with status code: ${response.status}`
      );
      error.code = response.status;
      throw error;
    }
    try {
      return await response.text();
    } catch (err) {
      return;
    }
  },
};

export { request };
