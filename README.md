FormForge
FormForge is a powerful web application for the dynamic creation, management, and display of forms.

This project is built using Angular and the Nx Monorepo architecture, which allows for efficient management of shared libraries and components. FormForge consists of two main parts:

Form Builder: A drag-and-drop interface for visually creating complex forms. It allows for the definition of fields, rules, and logic.

Form Renderer: A component that dynamically displays the created form based on a JSON schema, with support for the defined rules and conditions.

Key Features
Visual Form Builder: Easily drag and drop field components (text, select, radio buttons, etc.).

Reactive Form Management: Uses Reactive Forms for efficient state management.

Dynamic Rule Engine: Supports complex rules (AND/OR) that control the visibility and behavior of form fields.

Nx Monorepo: Organized and scalable code with clearly defined libraries and applications.

Standalone Components: A modern development approach using standalone Angular components, without the need for NgModule-s.

Technologies Used
Angular v17+: The main frontend framework.

TypeScript: A strongly typed language for more reliable code.

Nx: A monorepo tool for managing projects and shared libraries.

Tailwind CSS: A fast and efficient CSS utility-first library for styling.

CdkDragDrop: Angular Material CDK for drag-and-drop functionality.

Getting Started
To run the project locally, follow these steps:

Clone the repository:

Bash

git clone https://github.com/your-username/your-repository.git
cd your-repository
Install dependencies:

Bash

npm install
Run the application:
Start the main FormForge application.

Bash

nx serve FormForge
The application will be available at http://localhost:4200/.

Project Structure
The project is organized as an Nx monorepo.

apps/FormForge/: The main Angular application.

libs/form-builder/: A shared library with the logic and models for the Form Builder.

libs/ui/: A shared library with UI components (inputs, buttons, etc.).

This structure allows for easy code sharing and project scalability.

Contributing
We are always open to contributions! If you would like to help, please follow these steps:

Fork the repository.

Create a new branch (git checkout -b new-feature).

Make your changes and commit them.

Push to your branch.

Submit a Pull Request with a detailed description of your changes.
