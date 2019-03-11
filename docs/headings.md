Back End:

 

Database

ORM

API

 

Front end:

 

Actions:

 

Container Components.

Components.

Fetch and Save of data.

- Redux data structure conventions.

Rendering lifecycle.

ORM binding.

 

Deployment:

 

Codebase structure.

Deployment process.

Database updates.

Tagged version control.

 

BoilerPlate:

 

Any new packages e.g reducing reducer logic.

Copy and paste vs not.

 

Performance and Scale:

 

Code coverage.

Test levels, where tests are a must.

Load testing for base apps.

 

Design:

 

Front end and Back end more independent?

Referential integrity in database.

Retrieveal of only whats required vs everything and filter front end.

 

Coding style:

 

Clear processes on the following:

 

Back end:

 

- Create a script for schema changes, and order these scripts.

- Creating ORM models, add tests to verfiy this works.

- Create API end points, add tests to verify this works.

 

Front end:

 

- Creating reducer logic and storing state, and tests to verify this works.

- Create a actions to fetch and manipulate data (add selectors as well possibly), add tests to verify this works.

- Create component for view, add tests to verify render, mocking data. (keep component with only view logic).

- Wire component to actions.
