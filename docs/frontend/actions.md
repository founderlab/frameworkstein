
# Redux actions


Actions in Frameworkstein apps are generally kept lightweight and divided into two categories:

- Actions that involve remote requests (see [requests](frontend/requests)).
- Actions that only effect the local redux store.

Most actions in Frameworkstein apps tend to be of the former category. This is because, generally:
- If a change is important, it gets saved to the server.
- If a change isn't important it is likely small in scope and can be handled by component state.

