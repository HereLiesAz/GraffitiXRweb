# 8. Development Guidelines and Code of Conduct

This document outlines the best practices and standards for contributing to the GraffitiXR web application. Adhering to these guidelines ensures a high-quality, maintainable, and collaborative development environment.

### **Development Principles**

-   **State Management:** All state changes must follow the established unidirectional data flow pattern. State should be held in the appropriate component and passed down via props, with changes communicated back up via callbacks. Avoid creating "rogue" state that is not controlled by the React component lifecycle.
-   **Documentation:** All new public functions, components, and complex logic must be documented with clear, concise comments. Explain the "why" behind the code, not just the "what."
-   **Modularity:** Strive to create small, reusable components. If a component becomes too large or complex, refactor it into smaller, more manageable pieces.
-   **Code Style:** Follow the established code style of the project. Use the provided ESLint configuration to ensure consistency.

### **Code of Conduct**

This project and everyone participating in it is governed by a code of conduct. By participating, you are expected to uphold this code.

-   **Be Respectful:** We are a community of professionals and volunteers. Treat everyone with respect. Healthy debates are encouraged, but kindness is required.
-   **Be Collaborative:** The best solutions come from working together. Be open to feedback and willing to collaborate on changes.
-   **Be Considerate:** Your work will be used by other people, and you in turn will depend on the work of others. Any decision you take will affect users and colleagues, and you should take those consequences into account when making decisions.

### **Git Workflow**

1.  **Create a Branch:** All new features and bug fixes must be developed in a separate branch. Do not commit directly to `main`.
2.  **Commit Messages:** Write clear and descriptive commit messages. Follow the conventional commit format (e.g., `feat: Add new slider component`, `fix: Correct opacity calculation`).
3.  **Pull Requests:** When your work is complete, open a Pull Request (PR) against the `main` branch. Provide a clear description of the changes and link to any relevant issues.
4.  **Code Review:** All PRs must be reviewed and approved by at least one other contributor before being merged. Address all feedback from the review.