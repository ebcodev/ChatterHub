See https://github.com/ebcodev/ChatterHub-v1.0 for initial release reference
<!-- HEADER STYLE: CLASSIC -->
<div align="center">

<!-- BADGES -->
<!-- local repository, no metadata badges. -->

<em>Built with the tools and technologies:</em>

<img src="https://img.shields.io/badge/JSON-000000.svg?style=default&logo=JSON&logoColor=white" alt="JSON">
<img src="https://img.shields.io/badge/Replicate-000000.svg?style=default&logo=Replicate&logoColor=white" alt="Replicate">
<img src="https://img.shields.io/badge/Resend-000000.svg?style=default&logo=Resend&logoColor=white" alt="Resend">
<img src="https://img.shields.io/badge/Vercel-000000.svg?style=default&logo=Vercel&logoColor=white" alt="Vercel">
<img src="https://img.shields.io/badge/Simple%20Icons-111111.svg?style=default&logo=Simple-Icons&logoColor=white" alt="Simple%20Icons">
<img src="https://img.shields.io/badge/npm-CB3837.svg?style=default&logo=npm&logoColor=white" alt="npm">
<img src="https://img.shields.io/badge/Autoprefixer-DD3735.svg?style=default&logo=Autoprefixer&logoColor=white" alt="Autoprefixer">
<img src="https://img.shields.io/badge/PostCSS-DD3A0A.svg?style=default&logo=PostCSS&logoColor=white" alt="PostCSS">
<img src="https://img.shields.io/badge/Prettier-F7B93E.svg?style=default&logo=Prettier&logoColor=black" alt="Prettier">
<img src="https://img.shields.io/badge/.ENV-ECD53F.svg?style=default&logo=dotenv&logoColor=black" alt=".ENV">
<img src="https://img.shields.io/badge/JavaScript-F7DF1E.svg?style=default&logo=JavaScript&logoColor=black" alt="JavaScript">
<br>
<img src="https://img.shields.io/badge/sharp-99CC00.svg?style=default&logo=sharp&logoColor=white" alt="sharp">
<img src="https://img.shields.io/badge/React-61DAFB.svg?style=default&logo=React&logoColor=black" alt="React">
<img src="https://img.shields.io/badge/TypeScript-3178C6.svg?style=default&logo=TypeScript&logoColor=white" alt="TypeScript">
<img src="https://img.shields.io/badge/MDX-1B1F24.svg?style=default&logo=MDX&logoColor=white" alt="MDX">
<img src="https://img.shields.io/badge/Zod-3E67B1.svg?style=default&logo=Zod&logoColor=white" alt="Zod">
<img src="https://img.shields.io/badge/Stripe-635BFF.svg?style=default&logo=Stripe&logoColor=white" alt="Stripe">
<img src="https://img.shields.io/badge/ESLint-4B32C3.svg?style=default&logo=ESLint&logoColor=white" alt="ESLint">
<img src="https://img.shields.io/badge/OpenAI-412991.svg?style=default&logo=OpenAI&logoColor=white" alt="OpenAI">
<img src="https://img.shields.io/badge/Axios-5A29E4.svg?style=default&logo=Axios&logoColor=white" alt="Axios">
<img src="https://img.shields.io/badge/CSS-663399.svg?style=default&logo=CSS&logoColor=white" alt="CSS">

</div>
<br>

---

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Overview](#overview)
- [Features](#features)
- [Project Structure](#project-structure)
    - [Project Index](#project-index)
- [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
    - [Usage](#usage)
    - [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgments](#acknowledgments)

---

## Overview



---

## Features

|      | Component       | Details                              |
| :--- | :-------------- | :----------------------------------- |
| ⚙️  | **Architecture**  | <ul><li>Follows a **component-based architecture** using React components.</li><li>Utilizes **Next.js** for server-side rendering and routing.</li></ul> |
| 🔩 | **Code Quality**  | <ul><li>Consistent code formatting enforced with **Prettier**.</li><li>Linting rules maintained with **ESLint**.</li></ul> |
| 📄 | **Documentation** | <ul><li>Comprehensive documentation using **MDX** for clear explanations.</li><li>Inline code comments for better understanding.</li></ul> |
| 🔌 | **Integrations**  | <ul><li>Integration with **Supabase** for database operations.</li><li>Utilizes **Vercel** for deployment and analytics.</li></ul> |
| 🧩 | **Modularity**    | <ul><li>**Modularized components** for reusability and maintainability.</li><li>Separation of concerns with clear component responsibilities.</li></ul> |
| 🧪 | **Testing**       | <ul><li>**Unit tests** using **Jest** for component testing.</li><li>**Integration tests** for end-to-end functionality.</li></ul> |
| ⚡️  | **Performance**   | <ul><li>Optimized performance with **code splitting** and **lazy loading**.</li><li>Utilizes **TailwindCSS** for efficient styling.</li></ul> |
| 🛡️ | **Security**      | <ul><li>Secure data handling with **JWT** for authentication.</li><li>Follows best practices for **data encryption** and **access control**.</li></ul> |
| 📦 | **Dependencies**  | <ul><li>Utilizes a wide range of dependencies for various functionalities including **React**, **TailwindCSS**, **Next.js**, and more.</li></ul> |

---

## Project Structure

```sh
└── /
    ├── ChatterHub-Demo.mp4
    ├── components.json
    ├── eas.json
    ├── LICENSE
    ├── mdx-components.tsx
    ├── next.config.mjs
    ├── package.json
    ├── postcss.config.cjs
    ├── prettier.config.cjs
    ├── public
    │   ├── .well-known
    │   ├── apple-touch-icon.png
    │   ├── favicon-16x16.png
    │   ├── favicon-32x32.png
    │   ├── favicon.ico
    │   ├── logo
    │   ├── logos
    │   ├── site.webmanifest
    │   └── sw.js
    ├── README.md
    ├── src
    │   ├── components
    │   ├── contexts
    │   ├── env
    │   ├── hooks
    │   ├── lib
    │   ├── pages
    │   ├── styles
    │   └── utils
    ├── tailwind.config.cjs
    ├── tailwind.config.ts
    ├── tests
    │   ├── .env.test.example
    │   ├── providers
    │   ├── README.md
    │   ├── test-providers.ts
    │   └── utils
    └── tsconfig.json
```

### Project Index

<details open>
	<summary><b><code>/</code></b></summary>
	<!-- __root__ Submodule -->
	<details>
		<summary><b>__root__</b></summary>
		<blockquote>
			<div class='directory-path' style='padding: 8px 0; color: #666;'>
				<code><b>⦿ __root__</b></code>
			<table style='width: 100%; border-collapse: collapse;'>
			<thead>
				<tr style='background-color: #f8f9fa;'>
					<th style='width: 30%; text-align: left; padding: 8px;'>File Name</th>
					<th style='text-align: left; padding: 8px;'>Summary</th>
				</tr>
			</thead>
				<tr style='border-bottom: 1px solid #eee;'>
					<td style='padding: 8px;'><b><a href='/components.json'>components.json</a></b></td>
					<td style='padding: 8px;'>Define project structure and aliases for components, utilities, UI, and hooks in the components.json file, enhancing codebase organization and accessibility.</td>
				</tr>
				<tr style='border-bottom: 1px solid #eee;'>
					<td style='padding: 8px;'><b><a href='/eas.json'>eas.json</a></b></td>
					<td style='padding: 8px;'>- Enable easy configuration management with the provided eas.json file, centralizing settings for the entire project architecture<br>- This file streamlines the process of adjusting and maintaining various configurations, enhancing overall project scalability and flexibility.</td>
				</tr>
				<tr style='border-bottom: 1px solid #eee;'>
					<td style='padding: 8px;'><b><a href='/LICENSE'>LICENSE</a></b></td>
					<td style='padding: 8px;'>Define the projects licensing terms.</td>
				</tr>
				<tr style='border-bottom: 1px solid #eee;'>
					<td style='padding: 8px;'><b><a href='/mdx-components.tsx'>mdx-components.tsx</a></b></td>
					<td style='padding: 8px;'>- Enhances MDX components styling by applying consistent and refined design attributes<br>- Improves readability and visual appeal across headings, paragraphs, lists, tables, and code snippets<br>- Maintains flexibility by allowing customization through the injection of additional components.</td>
				</tr>
				<tr style='border-bottom: 1px solid #eee;'>
					<td style='padding: 8px;'><b><a href='/next.config.mjs'>next.config.mjs</a></b></td>
					<td style='padding: 8px;'>- Configure Next.js project settings for optimized image loading, MDX page support, and PWA headers<br>- Enable WebAssembly for accurate token counting<br>- Skip environment validation for Docker builds.</td>
				</tr>
				<tr style='border-bottom: 1px solid #eee;'>
					<td style='padding: 8px;'><b><a href='/package.json'>package.json</a></b></td>
					<td style='padding: 8px;'>Define project scripts and dependencies in package.json for the Next.js project.</td>
				</tr>
				<tr style='border-bottom: 1px solid #eee;'>
					<td style='padding: 8px;'><b><a href='/postcss.config.cjs'>postcss.config.cjs</a></b></td>
					<td style='padding: 8px;'>Configure PostCSS plugins for TailwindCSS and Autoprefixer in the projects PostCSS configuration.</td>
				</tr>
				<tr style='border-bottom: 1px solid #eee;'>
					<td style='padding: 8px;'><b><a href='/prettier.config.cjs'>prettier.config.cjs</a></b></td>
					<td style='padding: 8px;'>Configure Prettier to include Tailwind CSS plugin for consistent code formatting.</td>
				</tr>
				<tr style='border-bottom: 1px solid #eee;'>
					<td style='padding: 8px;'><b><a href='/tailwind.config.cjs'>tailwind.config.cjs</a></b></td>
					<td style='padding: 8px;'>- Define Tailwind CSS theme configurations for the project, including dark mode settings, content paths, custom color schemes, border radius values, and animation definitions<br>- Integrate Tailwind CSS plugins for enhanced styling capabilities.</td>
				</tr>
				<tr style='border-bottom: 1px solid #eee;'>
					<td style='padding: 8px;'><b><a href='/tailwind.config.ts'>tailwind.config.ts</a></b></td>
					<td style='padding: 8px;'>- Define Tailwind CSS configuration for projects theme, content, and plugins in tailwind.config.ts<br>- Tailwind CSS is a utility-first CSS framework that streamlines styling by providing pre-built classes<br>- The configuration file tailwind.config.ts centralizes settings for the projects design system, including theme customization and plugin integration.</td>
				</tr>
				<tr style='border-bottom: 1px solid #eee;'>
					<td style='padding: 8px;'><b><a href='/tsconfig.json'>tsconfig.json</a></b></td>
					<td style='padding: 8px;'>- Configure TypeScript compiler options for the project, targeting ES2017 with strict settings<br>- Enable JSX preservation, module resolution, and JSON module support<br>- Define path aliases for easier imports and exclude node_modules from compilation<br>- This file ensures consistent and efficient TypeScript compilation within the project architecture.</td>
				</tr>
			</table>
		</blockquote>
	</details>
	<!-- public Submodule -->
	<details>
		<summary><b>public</b></summary>
		<blockquote>
			<div class='directory-path' style='padding: 8px 0; color: #666;'>
				<code><b>⦿ public</b></code>
			<table style='width: 100%; border-collapse: collapse;'>
			<thead>
				<tr style='background-color: #f8f9fa;'>
					<th style='width: 30%; text-align: left; padding: 8px;'>File Name</th>
					<th style='text-align: left; padding: 8px;'>Summary</th>
				</tr>
			</thead>
				<tr style='border-bottom: 1px solid #eee;'>
					<td style='padding: 8px;'><b><a href='/public/site.webmanifest'>site.webmanifest</a></b></td>
					<td style='padding: 8px;'>- Define the purpose and functionality of the site.webmanifest file within the project architecture<br>- Highlight its role in configuring essential details like app name, description, icons, and shortcuts for the ChatterHub AI chat interface<br>- This file ensures proper display and functionality of the web application, enhancing user experience and accessibility.</td>
				</tr>
				<tr style='border-bottom: 1px solid #eee;'>
					<td style='padding: 8px;'><b><a href='/public/sw.js'>sw.js</a></b></td>
					<td style='padding: 8px;'>- Implement a ChatterHub Service Worker to cache static assets, clean up old caches on activation, and serve cached content with network fallback on fetch events<br>- This enhances performance by reducing network requests and providing offline support.</td>
				</tr>
			</table>
			<!-- .well-known Submodule -->
			<details>
				<summary><b>.well-known</b></summary>
				<blockquote>
					<div class='directory-path' style='padding: 8px 0; color: #666;'>
						<code><b>⦿ public..well-known</b></code>
					<table style='width: 100%; border-collapse: collapse;'>
					<thead>
						<tr style='background-color: #f8f9fa;'>
							<th style='width: 30%; text-align: left; padding: 8px;'>File Name</th>
							<th style='text-align: left; padding: 8px;'>Summary</th>
						</tr>
					</thead>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='/public/.well-known/apple-developer-merchantid-domain-association'>apple-developer-merchantid-domain-association</a></b></td>
							<td style='padding: 8px;'>- Generate a summary that highlights the main purpose and use of the provided code file within the projects architecture<br>- Start with a verb or noun to ensure clarity and conciseness<br>- Remember to avoid using terms like This file', The file, This code, etc<br>- Your response should be between 50-70 words.</td>
						</tr>
					</table>
				</blockquote>
			</details>
		</blockquote>
	</details>
	<!-- src Submodule -->
	<details>
		<summary><b>src</b></summary>
		<blockquote>
			<div class='directory-path' style='padding: 8px 0; color: #666;'>
				<code><b>⦿ src</b></code>
			<!-- components Submodule -->
			<details>
				<summary><b>components</b></summary>
				<blockquote>
					<div class='directory-path' style='padding: 8px 0; color: #666;'>
						<code><b>⦿ src.components</b></code>
					<table style='width: 100%; border-collapse: collapse;'>
					<thead>
						<tr style='background-color: #f8f9fa;'>
							<th style='width: 30%; text-align: left; padding: 8px;'>File Name</th>
							<th style='text-align: left; padding: 8px;'>Summary</th>
						</tr>
					</thead>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='/src/components/AudioVisualizer.tsx'>AudioVisualizer.tsx</a></b></td>
							<td style='padding: 8px;'>- Create an interactive AudioVisualizer component that dynamically visualizes audio levels<br>- It adjusts bars based on recording status, with smooth animations<br>- Supports recording controls, duration display, and transcription indication<br>- Responsive design options available.</td>
						</tr>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='/src/components/ChatInputArea.tsx'>ChatInputArea.tsx</a></b></td>
							<td style='padding: 8px;'>- Create a chat input area component that allows users to upload images with drag-and-drop functionality<br>- Users can preview and remove uploaded images, with error handling for file size and format<br>- The component includes a dropdown menu for attaching images and supports a maximum of 10 images, each up to 10MB.</td>
						</tr>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='/src/components/ChatWindow.tsx'>ChatWindow.tsx</a></b></td>
							<td style='padding: 8px;'>Displaying chat messages-Handling message attachments-Deleting messages-Rendering custom components for tools and approvals-Supporting markdown rendering for messages-Syntax highlighting for code snippetsOverall, the <code>ChatWindow</code> component plays a crucial role in the user interface of the application, providing a seamless chat experience with various functionalities to enhance user engagement.</td>
						</tr>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='/src/components/FreeformLayout.tsx'>FreeformLayout.tsx</a></b></td>
							<td style='padding: 8px;'>- Create a dynamic freeform layout for chat windows, enabling drag, resize, and z-index management<br>- Utilizes React for interactive window handling, with features like dragging, resizing, and bringing windows to the front<br>- The layout component offers a zoomable canvas for arranging chat windows freely, enhancing user experience and flexibility in managing multiple chats efficiently.</td>
						</tr>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='/src/components/LayoutGrid.tsx'>LayoutGrid.tsx</a></b></td>
							<td style='padding: 8px;'>- Define a dynamic grid layout for chats, enabling drag-and-drop functionality to rearrange chat positions<br>- The component manages chat organization based on specified layouts, optimizing user experience<br>- It supports various configurations like vertical, horizontal, and grid layouts, enhancing chat interaction and visual presentation within the application.</td>
						</tr>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='/src/components/MCPApprovalCard.tsx'>MCPApprovalCard.tsx</a></b></td>
							<td style='padding: 8px;'>- Create a React component for managing approval requests, displaying tool details, and allowing users to approve or deny access<br>- The component parses arguments, formats tool names, and provides a summary of key information<br>- Users can expand to view full details and take action accordingly<br>- The interface guides users through the approval process, ensuring informed decisions.</td>
						</tr>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='/src/components/MCPApprovalDialog.tsx'>MCPApprovalDialog.tsx</a></b></td>
							<td style='padding: 8px;'>- Create a dialog component for approving tool requests<br>- Display tool details, including a summary of key information extracted from arguments<br>- Users can approve or deny tool access, with an option to view full argument details<br>- Ensure user trust before granting access to external services.</td>
						</tr>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='/src/components/MCPToolDisplay.tsx'>MCPToolDisplay.tsx</a></b></td>
							<td style='padding: 8px;'>- Render a React component for displaying MCP tool details dynamically based on status<br>- Automatically expand for pending/executing/failed states to show live updates, collapsing for completed calls<br>- Parses tool arguments/results for user-friendly presentation<br>- Handles errors for safe rendering<br>- Enhances tool names for readability<br>- Includes status icons and text, expand/collapse functionality, and sections for arguments, results, and errors.</td>
						</tr>
					</table>
					<!-- layout Submodule -->
					<details>
						<summary><b>layout</b></summary>
						<blockquote>
							<div class='directory-path' style='padding: 8px 0; color: #666;'>
								<code><b>⦿ src.components.layout</b></code>
							<table style='width: 100%; border-collapse: collapse;'>
							<thead>
								<tr style='background-color: #f8f9fa;'>
									<th style='width: 30%; text-align: left; padding: 8px;'>File Name</th>
									<th style='text-align: left; padding: 8px;'>Summary</th>
								</tr>
							</thead>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='/src/components/layout/DashboardLayout.tsx'>DashboardLayout.tsx</a></b></td>
									<td style='padding: 8px;'>- Define the DashboardLayout component responsible for rendering a RootLayout with a top-center positioned Toaster for displaying notifications<br>- The main content is displayed within a flex container<br>- This component enhances the user experience by providing a structured layout for dashboard views.</td>
								</tr>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='/src/components/layout/footer.tsx'>footer.tsx</a></b></td>
									<td style='padding: 8px;'>- Define the footer layout for Vibe Marketing, showcasing the brands logo, tagline, and social links<br>- Includes options to display App Store and Play Store buttons<br>- Additionally, provides essential bottom links such as Terms of Service, Privacy Policy, and Support.</td>
								</tr>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='/src/components/layout/navigation.tsx'>navigation.tsx</a></b></td>
									<td style='padding: 8px;'>- Define the websites navigation structure and behavior by rendering a responsive header with logo, links, and a mobile-friendly menu<br>- Implement toggling functionality for the mobile menu to enhance user experience and ensure seamless navigation across devices.</td>
								</tr>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='/src/components/layout/RootLayout.tsx'>RootLayout.tsx</a></b></td>
									<td style='padding: 8px;'>Define the root layout component to render child elements within the projects architecture.</td>
								</tr>
							</table>
							<!-- navigation Submodule -->
							<details>
								<summary><b>navigation</b></summary>
								<blockquote>
									<div class='directory-path' style='padding: 8px 0; color: #666;'>
										<code><b>⦿ src.components.layout.navigation</b></code>
									<table style='width: 100%; border-collapse: collapse;'>
									<thead>
										<tr style='background-color: #f8f9fa;'>
											<th style='width: 30%; text-align: left; padding: 8px;'>File Name</th>
											<th style='text-align: left; padding: 8px;'>Summary</th>
										</tr>
									</thead>
										<tr style='border-bottom: 1px solid #eee;'>
											<td style='padding: 8px;'><b><a href='/src/components/layout/navigation/nav-links.tsx'>nav-links.tsx</a></b></td>
											<td style='padding: 8px;'>- Define and render navigation links for the layout component using Next.js Link, allowing users to navigate the site seamlessly<br>- The NavLinks component maps and displays links with labels, enhancing user experience and site usability.</td>
										</tr>
									</table>
								</blockquote>
							</details>
						</blockquote>
					</details>
					<!-- mcp Submodule -->
					<details>
						<summary><b>mcp</b></summary>
						<blockquote>
							<div class='directory-path' style='padding: 8px 0; color: #666;'>
								<code><b>⦿ src.components.mcp</b></code>
							<table style='width: 100%; border-collapse: collapse;'>
							<thead>
								<tr style='background-color: #f8f9fa;'>
									<th style='width: 30%; text-align: left; padding: 8px;'>File Name</th>
									<th style='text-align: left; padding: 8px;'>Summary</th>
								</tr>
							</thead>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='/src/components/mcp/MCPServerCard.tsx'>MCPServerCard.tsx</a></b></td>
									<td style='padding: 8px;'>- Create a React component for displaying and managing MCP servers<br>- It allows users to view, edit, delete, and toggle server status<br>- The component includes features like approval badges, custom headers, and built-in server indicators<br>- Users can activate/deactivate servers and receive toast notifications for successful actions.</td>
								</tr>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='/src/components/mcp/MCPServerForm.tsx'>MCPServerForm.tsx</a></b></td>
									<td style='padding: 8px;'>- Create and manage MCP servers with ease using the MCPServerForm component<br>- This component allows users to add or update server details, set tool approval preferences, manage available tools, and configure server settings effortlessly<br>- Streamline your MCP server management process efficiently.</td>
								</tr>
							</table>
						</blockquote>
					</details>
					<!-- modals Submodule -->
					<details>
						<summary><b>modals</b></summary>
						<blockquote>
							<div class='directory-path' style='padding: 8px 0; color: #666;'>
								<code><b>⦿ src.components.modals</b></code>
							<table style='width: 100%; border-collapse: collapse;'>
							<thead>
								<tr style='background-color: #f8f9fa;'>
									<th style='width: 30%; text-align: left; padding: 8px;'>File Name</th>
									<th style='text-align: left; padding: 8px;'>Summary</th>
								</tr>
							</thead>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='/src/components/modals/ChatSettingsModal.tsx'>ChatSettingsModal.tsx</a></b></td>
									<td style='padding: 8px;'>- Implement a modal for managing chat settings within the projects component structure<br>- The modal allows users to set a system prompt for guiding AI behavior, with options to override inherited prompts and upgrade for premium features<br>- Users can save changes or cancel, enhancing chat customization and functionality.</td>
								</tr>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='/src/components/modals/ColorPickerModal.tsx'>ColorPickerModal.tsx</a></b></td>
									<td style='padding: 8px;'>- Create a Color Picker Modal component that allows users to choose folder colors<br>- Display color options using Lucide icons and Tailwind CSS classes<br>- Users can select a color and apply it to the folder<br>- Include a cancel button to close the modal.</td>
								</tr>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='/src/components/modals/DeleteFolderModal.tsx'>DeleteFolderModal.tsx</a></b></td>
									<td style='padding: 8px;'>- Implement a modal component to delete folders, providing options to delete folder-only or folder with contents<br>- Displays progress and allows cancellation.</td>
								</tr>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='/src/components/modals/DuplicateProgressModal.tsx'>DuplicateProgressModal.tsx</a></b></td>
									<td style='padding: 8px;'>- Create a modal component for displaying duplicate progress during chat duplication<br>- Show step descriptions, progress percentage, and stats like messages and attachments copied<br>- Dynamically update content based on the current duplication step<br>- Provide a clear visual representation of the duplication process to users.</td>
								</tr>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='/src/components/modals/FolderSettingsModal.tsx'>FolderSettingsModal.tsx</a></b></td>
									<td style='padding: 8px;'>- Implement a modal for managing folder settings, including a system prompt feature<br>- Users can set prompts inherited by chat groups within the folder<br>- Premium users can access this feature<br>- The modal allows saving changes and provides information on prompt inheritance<br>- Users can cancel or save changes based on permissions.</td>
								</tr>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='/src/components/modals/LicenseKeyModal.tsx'>LicenseKeyModal.tsx</a></b></td>
									<td style='padding: 8px;'>- Implement a License Key Modal component that allows users to enter a license key to unlock premium features<br>- The modal provides a user-friendly interface with input validation and save functionality<br>- It enhances the user experience by guiding them through the process of activating premium features within the application.</td>
								</tr>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='/src/components/modals/MoveChatModal.tsx'>MoveChatModal.tsx</a></b></td>
									<td style='padding: 8px;'>- Facilitates moving chat groups between folders within a modal interface<br>- Displays a hierarchical folder tree for selection, with color-coded options<br>- Enables users to initiate the move and provides feedback on the process<br>- Supports cancellation and updates on successful moves.</td>
								</tr>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='/src/components/modals/StarredMessagesModal.tsx'>StarredMessagesModal.tsx</a></b></td>
									<td style='padding: 8px;'>- Display and manage starred messages within a modal interface<br>- View, unstar, and navigate to associated chat groups<br>- Utilizes React components for a dynamic user experience<br>- Integrates syntax highlighting and code copying functionalities for assistant messages<br>- Enhance user interaction and organization of important messages.</td>
								</tr>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='/src/components/modals/SupportModal.tsx'>SupportModal.tsx</a></b></td>
									<td style='padding: 8px;'>- Create a Support Modal component that displays support information and allows users to copy the support email address<br>- Include details on response times and what to include when contacting support<br>- The modal design is user-friendly and provides a seamless experience for users seeking assistance.</td>
								</tr>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='/src/components/modals/UpgradeModal.tsx'>UpgradeModal.tsx</a></b></td>
									<td style='padding: 8px;'>- Upgrade Modal ComponentThe <code>UpgradeModal</code> component is a crucial part of the project's user interface, specifically handling the upgrade process for users<br>- This component allows users to view and select different subscription options, providing information about the available plans and features<br>- It also includes a FAQ section to address common queries regarding the subscription model.By utilizing icons from <code>lucide-react</code>, managing state with <code>useState</code>, and integrating with the <code>LicenseContext</code>, this component ensures a seamless user experience when upgrading their account<br>- Additionally, it leverages <code>react-hot-toast</code> for notifications and <code>Accordion</code> components for organizing content effectively.Overall, the <code>UpgradeModal</code> component plays a significant role in guiding users through the upgrade process and providing essential information about subscription options, contributing to a user-friendly and informative interface within the application.</td>
								</tr>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='/src/components/modals/WelcomeModal.tsx'>WelcomeModal.tsx</a></b></td>
									<td style='padding: 8px;'>- Create a Welcome Modal component that displays a comprehensive introduction to the application<br>- It includes sections for the hero, features, quick start guide, benefits, and a call-to-action<br>- The modal is designed with a clean and user-friendly interface, enhancing the onboarding experience for users.</td>
								</tr>
							</table>
							<!-- welcome Submodule -->
							<details>
								<summary><b>welcome</b></summary>
								<blockquote>
									<div class='directory-path' style='padding: 8px 0; color: #666;'>
										<code><b>⦿ src.components.modals.welcome</b></code>
									<table style='width: 100%; border-collapse: collapse;'>
									<thead>
										<tr style='background-color: #f8f9fa;'>
											<th style='width: 30%; text-align: left; padding: 8px;'>File Name</th>
											<th style='text-align: left; padding: 8px;'>Summary</th>
										</tr>
									</thead>
										<tr style='border-bottom: 1px solid #eee;'>
											<td style='padding: 8px;'><b><a href='/src/components/modals/welcome/BenefitsSection.tsx'>BenefitsSection.tsx</a></b></td>
											<td style='padding: 8px;'>- Create a BenefitsSection component showcasing ChatterHubs advantages for AI power users<br>- It highlights key features like no monthly fees, complete privacy, access to major AI models, and professional tools<br>- The component includes visually appealing icons, titles, descriptions, and highlights for each benefit<br>- Additionally, it provides a comparison visualization to demonstrate the cost-effectiveness and inclusivity of ChatterHub compared to other models.</td>
										</tr>
										<tr style='border-bottom: 1px solid #eee;'>
											<td style='padding: 8px;'><b><a href='/src/components/modals/welcome/CTASection.tsx'>CTASection.tsx</a></b></td>
											<td style='padding: 8px;'>Define the main user interaction flow for the welcome modal CTA section, guiding users to explore key features and take primary and secondary actions within the AI platform.</td>
										</tr>
										<tr style='border-bottom: 1px solid #eee;'>
											<td style='padding: 8px;'><b><a href='/src/components/modals/welcome/FeaturesGrid.tsx'>FeaturesGrid.tsx</a></b></td>
											<td style='padding: 8px;'>- Render a feature grid showcasing multiple AI models, parallel chats, smart organization, privacy-first approach, customizable AI behavior, and voice input capabilities<br>- Each feature is represented by an icon, title, and description with a gradient background<br>- Additionally, a placeholder for feature previews is included.</td>
										</tr>
										<tr style='border-bottom: 1px solid #eee;'>
											<td style='padding: 8px;'><b><a href='/src/components/modals/welcome/HeroSection.tsx'>HeroSection.tsx</a></b></td>
											<td style='padding: 8px;'>- Render a welcoming HeroSection component displaying ChatterHubs branding and tagline<br>- It showcases a decorative logo, main heading, tagline, and social proof stats<br>- The component sets the tone for the AI workspace platform, emphasizing privacy and powerful chat capabilities.</td>
										</tr>
										<tr style='border-bottom: 1px solid #eee;'>
											<td style='padding: 8px;'><b><a href='/src/components/modals/welcome/QuickStartSection.tsx'>QuickStartSection.tsx</a></b></td>
											<td style='padding: 8px;'>- Guide users through ChatterHub setup effortlessly with the QuickStartSection component<br>- It presents a streamlined onboarding process in four steps, from adding API keys to exploring advanced features<br>- Each step is visually represented with icons, making the setup intuitive and engaging.</td>
										</tr>
									</table>
								</blockquote>
							</details>
						</blockquote>
					</details>
					<!-- models Submodule -->
					<details>
						<summary><b>models</b></summary>
						<blockquote>
							<div class='directory-path' style='padding: 8px 0; color: #666;'>
								<code><b>⦿ src.components.models</b></code>
							<table style='width: 100%; border-collapse: collapse;'>
							<thead>
								<tr style='background-color: #f8f9fa;'>
									<th style='width: 30%; text-align: left; padding: 8px;'>File Name</th>
									<th style='text-align: left; padding: 8px;'>Summary</th>
								</tr>
							</thead>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='/src/components/models/CustomModelCard.tsx'>CustomModelCard.tsx</a></b></td>
									<td style='padding: 8px;'>- Render a customizable card displaying model details with options to edit, activate/deactivate, and delete<br>- The card showcases model information, pricing, API type, provider, and capabilities<br>- Users can interact with the models status and perform actions like editing and deleting<br>- The card design includes visual indicators for model status and relevant information.</td>
								</tr>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='/src/components/models/CustomModelForm.tsx'>CustomModelForm.tsx</a></b></td>
									<td style='padding: 8px;'>- CustomModelFormThe <code>CustomModelForm</code> component in the <code>src\components\models\CustomModelForm.tsx</code> file is a crucial part of the projects architecture<br>- It serves as a user interface for creating and editing custom models within the application<br>- This component allows users to input and configure various parameters such as model name, API type, icon URL, base URL, and context window size<br>- Additionally, it provides functionalities for adding and updating custom models through integration with the <code>useCustomModels</code> hook<br>- The <code>CustomModelForm</code> component plays a vital role in managing custom models efficiently, enhancing the overall user experience of the application.</td>
								</tr>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='/src/components/models/OpenRouterBrowser.tsx'>OpenRouterBrowser.tsx</a></b></td>
									<td style='padding: 8px;'>- Create a dynamic OpenRouter model browser component that allows users to browse, filter, and import models from OpenRouters catalog<br>- The component fetches and displays models based on search queries and sorting preferences, providing a seamless experience for users to explore and add custom models to their collection.</td>
								</tr>
							</table>
						</blockquote>
					</details>
					<!-- prompts Submodule -->
					<details>
						<summary><b>prompts</b></summary>
						<blockquote>
							<div class='directory-path' style='padding: 8px 0; color: #666;'>
								<code><b>⦿ src.components.prompts</b></code>
							<table style='width: 100%; border-collapse: collapse;'>
							<thead>
								<tr style='background-color: #f8f9fa;'>
									<th style='width: 30%; text-align: left; padding: 8px;'>File Name</th>
									<th style='text-align: left; padding: 8px;'>Summary</th>
								</tr>
							</thead>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='/src/components/prompts/BuiltinPromptCard.tsx'>BuiltinPromptCard.tsx</a></b></td>
									<td style='padding: 8px;'>- Create a BuiltinPromptCard component to display and interact with predefined prompts<br>- It allows users to import prompts to their library, view details, and select prompts<br>- The component showcases prompt information, tags, and content preview, enhancing user engagement and management of prompts within the application.</td>
								</tr>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='/src/components/prompts/PromptCard.tsx'>PromptCard.tsx</a></b></td>
									<td style='padding: 8px;'>- Implement a dynamic PromptCard component that displays prompts with options to edit, delete, star, duplicate, and use them<br>- It includes a confirmation dialog for deleting prompts<br>- The component enhances user interaction and management of prompts within the application.</td>
								</tr>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='/src/components/prompts/PromptDetailsModal.tsx'>PromptDetailsModal.tsx</a></b></td>
									<td style='padding: 8px;'>- Create a modal to display and import prompts<br>- Display prompt details like title, description, tags, and content<br>- Users can import prompts to their library with a single click<br>- The modal design includes a header, content section with tags and prompt content, and a footer with import and close buttons.</td>
								</tr>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='/src/components/prompts/PromptForm.tsx'>PromptForm.tsx</a></b></td>
									<td style='padding: 8px;'>- Create a form component for editing or adding prompts<br>- Handles input fields for title, description, content, and tags<br>- Allows users to add, remove tags, and submit prompts<br>- Provides real-time validation and feedback messages.</td>
								</tr>
							</table>
						</blockquote>
					</details>
					<!-- pwa Submodule -->
					<details>
						<summary><b>pwa</b></summary>
						<blockquote>
							<div class='directory-path' style='padding: 8px 0; color: #666;'>
								<code><b>⦿ src.components.pwa</b></code>
							<table style='width: 100%; border-collapse: collapse;'>
							<thead>
								<tr style='background-color: #f8f9fa;'>
									<th style='width: 30%; text-align: left; padding: 8px;'>File Name</th>
									<th style='text-align: left; padding: 8px;'>Summary</th>
								</tr>
							</thead>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='/src/components/pwa/InstallPrompt.tsx'>InstallPrompt.tsx</a></b></td>
									<td style='padding: 8px;'>- Implement a component to prompt users to install the PWA app, enhancing the user experience<br>- It manages the installation process, displays a custom prompt, and handles user responses effectively<br>- The component ensures a seamless transition to a native app-like interface, offering offline access and a lightweight, fast-loading experience.</td>
								</tr>
							</table>
						</blockquote>
					</details>
					<!-- settings Submodule -->
					<details>
						<summary><b>settings</b></summary>
						<blockquote>
							<div class='directory-path' style='padding: 8px 0; color: #666;'>
								<code><b>⦿ src.components.settings</b></code>
							<table style='width: 100%; border-collapse: collapse;'>
							<thead>
								<tr style='background-color: #f8f9fa;'>
									<th style='width: 30%; text-align: left; padding: 8px;'>File Name</th>
									<th style='text-align: left; padding: 8px;'>Summary</th>
								</tr>
							</thead>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='/src/components/settings/AboutTab.tsx'>AboutTab.tsx</a></b></td>
									<td style='padding: 8px;'>- Describe the purpose and use of the AboutTab component in the projects settings section<br>- It showcases ChatterHubs logo, description, and important links like Terms & Conditions, Privacy Policy, and Help Center<br>- This component contributes to the user interface by providing essential information and navigation options.</td>
								</tr>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='/src/components/settings/AdvancedTab.tsx'>AdvancedTab.tsx</a></b></td>
									<td style='padding: 8px;'>- Implement a feature in the Advanced Settings component to manage and delete all chat data, including conversations, folders, and attachments<br>- Users can confirm deletion by entering a generated code<br>- The component also displays the estimated local database size<br>- This functionality enhances data management capabilities within the application.</td>
								</tr>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='/src/components/settings/ApiKeysTab.tsx'>ApiKeysTab.tsx</a></b></td>
									<td style='padding: 8px;'>- Create a user-friendly interface to manage API keys for various AI providers securely<br>- Users can input and store their keys locally without sending them to external servers<br>- The component allows easy access to different provider platforms for obtaining API keys<br>- Additionally, it offers a seamless experience with auto-saving functionality, eliminating the need for manual saves.</td>
								</tr>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='/src/components/settings/AppearanceTab.tsx'>AppearanceTab.tsx</a></b></td>
									<td style='padding: 8px;'>- Implement a component that allows users to select between light, dark, or system themes for ChatterHubs appearance<br>- Users can customize the apps look or sync it with their device settings<br>- The component provides visual feedback for the selected theme and offers a tip for the system theme option.</td>
								</tr>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='/src/components/settings/ImportExportTab.tsx'>ImportExportTab.tsx</a></b></td>
									<td style='padding: 8px;'>- SummaryThe <code>ImportExportTab.tsx</code> file in the <code>src\components\settings</code> directory of the project facilitates importing and exporting data<br>- It provides functionality to import data from sources like ChatGPT and ChatterHub, and export data using ChatterHub<br>- The file manages states related to importing, parsing, selected conversations, import progress, and import results<br>- This component plays a crucial role in enabling users to manage their data effectively within the application.</td>
								</tr>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='/src/components/settings/SpeechTab.tsx'>SpeechTab.tsx</a></b></td>
									<td style='padding: 8px;'>- Implement a SpeechTab component that manages voice input settings, including transcription model selection and auto-saving functionality<br>- It enables users to transcribe speech into text messages using OpenAIs API, with options for model selection and word corrections prompt<br>- The component also provides system prompts for transcription accuracy and user instructions on how to use voice input effectively.</td>
								</tr>
							</table>
						</blockquote>
					</details>
					<!-- sidebar Submodule -->
					<details>
						<summary><b>sidebar</b></summary>
						<blockquote>
							<div class='directory-path' style='padding: 8px 0; color: #666;'>
								<code><b>⦿ src.components.sidebar</b></code>
							<table style='width: 100%; border-collapse: collapse;'>
							<thead>
								<tr style='background-color: #f8f9fa;'>
									<th style='width: 30%; text-align: left; padding: 8px;'>File Name</th>
									<th style='text-align: left; padding: 8px;'>Summary</th>
								</tr>
							</thead>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='/src/components/sidebar/ChatSidebar.tsx'>ChatSidebar.tsx</a></b></td>
									<td style='padding: 8px;'>- Chat Sidebar ComponentThe <code>ChatSidebar.tsx</code> file in the <code>src\components\sidebar</code> directory is a crucial component of the project's architecture<br>- This component is responsible for managing the display and interactions related to chat groups and folders within the application<br>- It leverages various functionalities such as creating, deleting, and organizing chat groups and folders<br>- Additionally, it integrates features like modals, dropdown menus, and alert dialogs to enhance the user experience.By encapsulating these chat-related functionalities, the <code>ChatSidebar</code> component plays a vital role in providing users with a seamless and intuitive interface for managing their conversations<br>- It acts as a central hub for accessing and organizing chat content, contributing significantly to the overall user engagement and satisfaction within the application.</td>
								</tr>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='/src/components/sidebar/NavigationSidebar.tsx'>NavigationSidebar.tsx</a></b></td>
									<td style='padding: 8px;'>- Create a sidebar navigation component that dynamically displays menu items based on the current route<br>- It includes icons for various sections like Chat, Prompts, Models, MCP Servers, and Settings<br>- Users can toggle between light and dark themes, view user information, access billing, and seek support<br>- The component enhances user experience and navigation within the application.</td>
								</tr>
							</table>
						</blockquote>
					</details>
					<!-- ui Submodule -->
					<details>
						<summary><b>ui</b></summary>
						<blockquote>
							<div class='directory-path' style='padding: 8px 0; color: #666;'>
								<code><b>⦿ src.components.ui</b></code>
							<table style='width: 100%; border-collapse: collapse;'>
							<thead>
								<tr style='background-color: #f8f9fa;'>
									<th style='width: 30%; text-align: left; padding: 8px;'>File Name</th>
									<th style='text-align: left; padding: 8px;'>Summary</th>
								</tr>
							</thead>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='/src/components/ui/accordion.tsx'>accordion.tsx</a></b></td>
									<td style='padding: 8px;'>- Define and export React components for an accordion UI feature<br>- The components include the root accordion, item, trigger, and content<br>- These components facilitate the creation of interactive accordion elements with collapsible content sections.</td>
								</tr>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='/src/components/ui/alert-dialog.tsx'>alert-dialog.tsx</a></b></td>
									<td style='padding: 8px;'>- Define and structure alert dialog components for UI interactions within the project architecture<br>- Implement various elements like triggers, overlays, content, headers, footers, titles, descriptions, actions, and cancellations<br>- These components enhance user experience by providing a consistent and visually appealing way to handle alerts and notifications throughout the application.</td>
								</tr>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='/src/components/ui/badge.tsx'>badge.tsx</a></b></td>
									<td style='padding: 8px;'>Define badge component styling and variants for UI consistency across the project.</td>
								</tr>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='/src/components/ui/button-group.tsx'>button-group.tsx</a></b></td>
									<td style='padding: 8px;'>- Create a flexible ButtonGroup component for managing a group of buttons with ease<br>- It allows users to handle button clicks and style changes efficiently<br>- The ButtonGroupItem component simplifies button rendering within the group.</td>
								</tr>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='/src/components/ui/button.tsx'>button.tsx</a></b></td>
									<td style='padding: 8px;'>- Define and customize button components with various styles and sizes<br>- Utilize predefined variants like default, destructive, outline, secondary, ghost, and link<br>- Easily integrate buttons as children or button elements<br>- Achieve consistent button styling across the project using the provided buttonVariants object.</td>
								</tr>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='/src/components/ui/card.tsx'>card.tsx</a></b></td>
									<td style='padding: 8px;'>- Define UI components for cards with header, title, description, content, and footer<br>- Each component handles specific card elements, enhancing modularity and reusability within the projects UI architecture.</td>
								</tr>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='/src/components/ui/checkbox.tsx'>checkbox.tsx</a></b></td>
									<td style='padding: 8px;'>- Create a reusable Checkbox component for UI interactions<br>- Integrates with Radix UI Checkbox and Lucide icons<br>- Handles styling, states, and accessibility features<br>- Ideal for enhancing user experience in web applications.</td>
								</tr>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='/src/components/ui/collapsible.tsx'>collapsible.tsx</a></b></td>
									<td style='padding: 8px;'>Expose collapsible UI components for easy integration within the projects architecture.</td>
								</tr>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='/src/components/ui/data-table-loading.tsx'>data-table-loading.tsx</a></b></td>
									<td style='padding: 8px;'>Generate skeleton loading UI for data tables with specified column and row counts.</td>
								</tr>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='/src/components/ui/data-table.tsx'>data-table.tsx</a></b></td>
									<td style='padding: 8px;'>- Define a reusable DataTable component that renders tabular data with customizable columns and row click functionality<br>- Utilizes @tanstack/react-table for data handling and table structure<br>- Handles empty data scenarios gracefully.</td>
								</tr>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='/src/components/ui/dialog.tsx'>dialog.tsx</a></b></td>
									<td style='padding: 8px;'>- Define and render dialog components for UI interactions within the React application<br>- Implementing various elements like triggers, overlays, content, headers, footers, titles, and descriptions to facilitate interactive dialog functionality.</td>
								</tr>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='/src/components/ui/dropdown-menu.tsx'>dropdown-menu.tsx</a></b></td>
									<td style='padding: 8px;'>- Define and export various components for a dropdown menu UI, including triggers, content, items, labels, separators, and shortcuts<br>- These components facilitate the creation of interactive and visually appealing dropdown menus within the projects user interface.</td>
								</tr>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='/src/components/ui/input.tsx'>input.tsx</a></b></td>
									<td style='padding: 8px;'>- Create a reusable Input component for UI forms, enhancing user experience by providing a consistent and styled input field across the application<br>- This component simplifies the development process by encapsulating input field logic and styling, promoting code reusability and maintainability.</td>
								</tr>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='/src/components/ui/label.tsx'>label.tsx</a></b></td>
									<td style='padding: 8px;'>- Define a React component for labels with variant styles, leveraging Radix UI for consistent design<br>- The component integrates with Class Variance Authority for dynamic class generation, enhancing code maintainability<br>- This Label component encapsulates label rendering logic, promoting reusability and scalability within the UI architecture.</td>
								</tr>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='/src/components/ui/modal.tsx'>modal.tsx</a></b></td>
									<td style='padding: 8px;'>- Define and render a modal component that displays content within a fixed overlay<br>- The modal can be opened or closed based on the provided state, with the ability to customize its appearance and behavior<br>- This component ensures a seamless user experience by rendering content in a modal format within the application.</td>
								</tr>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='/src/components/ui/navigation-menu.tsx'>navigation-menu.tsx</a></b></td>
									<td style='padding: 8px;'>- Define and structure navigation menu components for React UI using Radix UI primitives<br>- Implement menu, list, item, trigger, content, link, viewport, and indicator components with specific styles and animations<br>- Facilitate seamless navigation interactions within the applications user interface.</td>
								</tr>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='/src/components/ui/page-tabs.tsx'>page-tabs.tsx</a></b></td>
									<td style='padding: 8px;'>- Define and render interactive page tabs with icons, labels, and counts<br>- Enable tab switching functionality based on user interaction.</td>
								</tr>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='/src/components/ui/progress.tsx'>progress.tsx</a></b></td>
									<td style='padding: 8px;'>- Define a React component for displaying progress bars with customizable values and styles<br>- The component renders a visually appealing progress bar that dynamically adjusts its width based on the provided value<br>- It enhances user experience by visually representing progress within the application.</td>
								</tr>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='/src/components/ui/radio-group.tsx'>radio-group.tsx</a></b></td>
									<td style='padding: 8px;'>- Define and export a RadioGroup component and a RadioGroupItem component for UI radio group functionality<br>- These components leverage Radix UI and Lucide React for seamless integration and visual representation<br>- The RadioGroupItem component includes indicators for user interaction feedback.</td>
								</tr>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='/src/components/ui/scroll-area.tsx'>scroll-area.tsx</a></b></td>
									<td style='padding: 8px;'>- Define and structure scrollable UI components for React using Radix UIs scroll area primitives<br>- Forward refs for ScrollArea and ScrollBar to manage scrolling behavior and appearance<br>- Encapsulate functionality for creating scrollable areas with customizable scrollbars in a clean and modular manner.</td>
								</tr>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='/src/components/ui/select.tsx'>select.tsx</a></b></td>
									<td style='padding: 8px;'>- Define and structure UI components for a select dropdown feature<br>- Implement key elements like trigger, content, label, items, separators, and scroll buttons<br>- Enhance user interaction and visual presentation within the projects component architecture.</td>
								</tr>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='/src/components/ui/separator.tsx'>separator.tsx</a></b></td>
									<td style='padding: 8px;'>- Define a React component, Separator, to render a visual divider in either horizontal or vertical orientation<br>- Utilizes Radix UI for consistent styling<br>- The component supports customization through props like orientation and decorative<br>- This component enhances UI structure and layout within the project.</td>
								</tr>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='/src/components/ui/sheet.tsx'>sheet.tsx</a></b></td>
									<td style='padding: 8px;'>- Define and structure UI components for a sheet interface<br>- Implement overlay, content, header, footer, title, and description elements<br>- Manage sheet opening and closing animations based on specified side variants<br>- Facilitate user interaction with triggers and close buttons<br>- Enhance user experience by providing a customizable and visually appealing sheet layout.</td>
								</tr>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='/src/components/ui/sidebar.tsx'>sidebar.tsx</a></b></td>
									<td style='padding: 8px;'>- Project SummaryThe <code>sidebar.tsx</code> file, located in the <code>src\components\ui\</code> directory, plays a crucial role in the projects user interface architecture<br>- It defines the sidebar component that provides essential functionality for managing the sidebar state, such as expanding or collapsing it<br>- The sidebar offers various features like buttons, inputs, separators, tooltips, and more, enhancing the overall user experience<br>- Additionally, it includes responsive design considerations for mobile devices, ensuring a seamless transition between different screen sizes<br>- The file encapsulates the logic for handling sidebar interactions and maintaining its state, contributing significantly to the project's UI/UX design and functionality.</td>
								</tr>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='/src/components/ui/skeleton.tsx'>skeleton.tsx</a></b></td>
									<td style='padding: 8px;'>- Define a reusable UI component, Skeleton, to render a loading animation with customizable styling<br>- The component enhances user experience by providing visual feedback during data fetching processes<br>- It promotes a consistent design language across the applications UI elements.</td>
								</tr>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='/src/components/ui/spinner.tsx'>spinner.tsx</a></b></td>
									<td style='padding: 8px;'>- Define a reusable Spinner component for displaying loading indicators in the UI<br>- The component leverages a third-party library for the spinner icon and allows customization through CSS classes<br>- This component enhances user experience by providing visual feedback during asynchronous operations.</td>
								</tr>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='/src/components/ui/switch.tsx'>switch.tsx</a></b></td>
									<td style='padding: 8px;'>- Define a React component Switch that leverages Radix UIs switch primitives for a customizable UI toggle<br>- The component encapsulates styling and functionality for a sleek, interactive switch element.</td>
								</tr>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='/src/components/ui/table.tsx'>table.tsx</a></b></td>
									<td style='padding: 8px;'>- Define a set of reusable React components for building tables<br>- Includes components for the table, header, body, footer, rows, header cells, regular cells, and captions<br>- Each component is designed to handle specific table functionalities, enhancing modularity and maintainability within the projects UI architecture.</td>
								</tr>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='/src/components/ui/tabs.tsx'>tabs.tsx</a></b></td>
									<td style='padding: 8px;'>- Define and export UI components for tabs functionality using Radix UI in the specified file path<br>- The components include Tabs, TabsList, TabsTrigger, and TabsContent, each serving a distinct role in managing tab interactions within the projects architecture.</td>
								</tr>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='/src/components/ui/textarea.tsx'>textarea.tsx</a></b></td>
									<td style='padding: 8px;'>- Create a reusable Textarea component for UI input handling within the projects component architecture<br>- The component integrates with React to render a customizable textarea element, enhancing user interaction and visual consistency across the application.</td>
								</tr>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='/src/components/ui/time-picker-input.tsx'>time-picker-input.tsx</a></b></td>
									<td style='padding: 8px;'>- Enables interactive time input with validation and formatting based on user actions and time picker settings<br>- Handles key events for navigation and value manipulation, ensuring a seamless user experience<br>- Integrates with the UI input component for a consistent look and feel.</td>
								</tr>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='/src/components/ui/time-picker-utils.tsx'>time-picker-utils.tsx</a></b></td>
									<td style='padding: 8px;'>- Provide utility functions for validating and manipulating time values in various formats, ensuring correctness and consistency<br>- Includes functions for setting and getting minutes, seconds, hours, and 12-hour time with AM/PM distinction<br>- Handles conversions between 12-hour and 24-hour formats for accurate time representation.</td>
								</tr>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='/src/components/ui/tooltip.tsx'>tooltip.tsx</a></b></td>
									<td style='padding: 8px;'>- Define and export UI components for tooltips using React and Radix-UI<br>- Implement Tooltip, TooltipTrigger, and TooltipContent with customizable styles and animations<br>- The TooltipContent component handles the tooltips appearance and behavior, enhancing user interactions within the application.</td>
								</tr>
							</table>
						</blockquote>
					</details>
				</blockquote>
			</details>
			<!-- contexts Submodule -->
			<details>
				<summary><b>contexts</b></summary>
				<blockquote>
					<div class='directory-path' style='padding: 8px 0; color: #666;'>
						<code><b>⦿ src.contexts</b></code>
					<table style='width: 100%; border-collapse: collapse;'>
					<thead>
						<tr style='background-color: #f8f9fa;'>
							<th style='width: 30%; text-align: left; padding: 8px;'>File Name</th>
							<th style='text-align: left; padding: 8px;'>Summary</th>
						</tr>
					</thead>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='/src/contexts/ApiKeysContext.tsx'>ApiKeysContext.tsx</a></b></td>
							<td style='padding: 8px;'>- Manage API keys securely within a React context, ensuring key availability across components<br>- Utilizes local storage for persistence and provides hooks for key retrieval and updates<br>- Maintains a check for any existing keys.</td>
						</tr>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='/src/contexts/LicenseContext.tsx'>LicenseContext.tsx</a></b></td>
							<td style='padding: 8px;'>- Manage the applications licensing state and activation<br>- Validate license keys, track device activation, and enforce message limits<br>- Detect browser and OS information<br>- Ensure license validity every 6 hours<br>- Activate, validate, and store license keys securely<br>- Check and enforce message limits for free tier users.</td>
						</tr>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='/src/contexts/SettingsContext.tsx'>SettingsContext.tsx</a></b></td>
							<td style='padding: 8px;'>- Define and manage speech settings within the React app using the SettingsContext file<br>- This file establishes a context for speech-related configurations, allowing components to access and update these settings<br>- It provides functions to modify speech settings and ensures data persistence through local storage<br>- The SettingsProvider component encapsulates these functionalities for seamless integration across the application.</td>
						</tr>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='/src/contexts/ThemeContext.tsx'>ThemeContext.tsx</a></b></td>
							<td style='padding: 8px;'>- Manage theme settings and apply them to the UI based on user preferences<br>- The code in ThemeContext.tsx creates a context for handling light, dark, or system themes<br>- It ensures the theme is stored and applied correctly, including updating based on system preferences<br>- The ThemeProvider component manages theme state, while useTheme hook provides access to the current theme.</td>
						</tr>
					</table>
				</blockquote>
			</details>
			<!-- env Submodule -->
			<details>
				<summary><b>env</b></summary>
				<blockquote>
					<div class='directory-path' style='padding: 8px 0; color: #666;'>
						<code><b>⦿ src.env</b></code>
					<table style='width: 100%; border-collapse: collapse;'>
					<thead>
						<tr style='background-color: #f8f9fa;'>
							<th style='width: 30%; text-align: left; padding: 8px;'>File Name</th>
							<th style='text-align: left; padding: 8px;'>Summary</th>
						</tr>
					</thead>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='/src/env/client.mjs'>client.mjs</a></b></td>
							<td style='padding: 8px;'>- Validate and format client environment variables, ensuring they adhere to specified schema<br>- Log and throw errors for invalid variables<br>- Export validated environment variables for use in the project.</td>
						</tr>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='/src/env/schema.mjs'>schema.mjs</a></b></td>
							<td style='padding: 8px;'>- Define server and client environment variable schemas to ensure valid configurations<br>- Manually map process environment variables to schema keys for Next.js<br>- Server-side schema includes Polar and Inngest keys, while client-side schema prefixes vars with <code>NEXT_PUBLIC_</code><br>- This setup safeguards against invalid environment variables during app builds.</td>
						</tr>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='/src/env/server.mjs'>server.mjs</a></b></td>
							<td style='padding: 8px;'>- Validate and merge server and client environment variables to ensure secure configuration in the app build process<br>- Prohibit server-side variables from being exposed and handle invalid configurations to maintain a robust environment setup<br>- This file plays a crucial role in safeguarding the applications environment integrity.</td>
						</tr>
					</table>
				</blockquote>
			</details>
			<!-- hooks Submodule -->
			<details>
				<summary><b>hooks</b></summary>
				<blockquote>
					<div class='directory-path' style='padding: 8px 0; color: #666;'>
						<code><b>⦿ src.hooks</b></code>
					<table style='width: 100%; border-collapse: collapse;'>
					<thead>
						<tr style='background-color: #f8f9fa;'>
							<th style='width: 30%; text-align: left; padding: 8px;'>File Name</th>
							<th style='text-align: left; padding: 8px;'>Summary</th>
						</tr>
					</thead>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='/src/hooks/use-debounce.ts'>use-debounce.ts</a></b></td>
							<td style='padding: 8px;'>- Implement a custom hook for debouncing values in React<br>- The <code>useDebounce</code> hook delays updating the value until a specified time has passed without further updates<br>- This helps optimize performance by reducing unnecessary re-renders in components that rely on frequently changing input values.</td>
						</tr>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='/src/hooks/use-mobile.tsx'>use-mobile.tsx</a></b></td>
							<td style='padding: 8px;'>- Define a custom hook to determine if the users device is mobile based on a specific breakpoint<br>- The hook utilizes Reacts state and effect hooks to track the device's width and updates the mobile status accordingly<br>- This functionality aids in responsive design implementation within the project's architecture.</td>
						</tr>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='/src/hooks/useImageAttachments.ts'>useImageAttachments.ts</a></b></td>
							<td style='padding: 8px;'>- Enable retrieval and processing of image attachments for a specified chat group<br>- Load and convert blob data to URLs, facilitating efficient attachment handling<br>- The code ensures proper URL cleanup upon unmount, enhancing performance and user experience within the chat application architecture.</td>
						</tr>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='/src/hooks/useSpeechRecording.ts'>useSpeechRecording.ts</a></b></td>
							<td style='padding: 8px;'>- Enable real-time speech-to-text transcription using OpenAIs API<br>- This hook manages recording audio, visualizing levels, and transcribing speech<br>- It handles errors and provides controls to start, stop, and cancel recordings<br>- The code integrates with OpenAI for transcription, offering flexibility with different models and system prompts.</td>
						</tr>
					</table>
				</blockquote>
			</details>
			<!-- lib Submodule -->
			<details>
				<summary><b>lib</b></summary>
				<blockquote>
					<div class='directory-path' style='padding: 8px 0; color: #666;'>
						<code><b>⦿ src.lib</b></code>
					<table style='width: 100%; border-collapse: collapse;'>
					<thead>
						<tr style='background-color: #f8f9fa;'>
							<th style='width: 30%; text-align: left; padding: 8px;'>File Name</th>
							<th style='text-align: left; padding: 8px;'>Summary</th>
						</tr>
					</thead>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='/src/lib/db.ts'>db.ts</a></b></td>
							<td style='padding: 8px;'>- Manage database schema and interactions for ChatterHub, storing folders, chat groups, messages, models, and more<br>- Dexie library powers this file, defining interfaces for structured data storage<br>- The ChatterHubDB class extends Dexie, providing tables for each data type, ensuring efficient data management within the application.</td>
						</tr>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='/src/lib/index.ts'>index.ts</a></b></td>
							<td style='padding: 8px;'>Expose utility functions for broader usage within the projects architecture.</td>
						</tr>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='/src/lib/models.ts'>models.ts</a></b></td>
							<td style='padding: 8px;'>- SummaryThe <code>models.ts</code> file in the <code>src\lib</code> directory defines the structure of a <code>Model</code> interface used within the project<br>- This interface specifies properties such as <code>id</code>, <code>name</code>, <code>contextWindow</code>, <code>isNew</code>, <code>provider</code>, <code>apiType</code>, <code>baseUrl</code>, <code>customModelData</code>, <code>supportsReasoningEffort</code>, and <code>supportsMCP</code><br>- These properties are crucial for defining and interacting with different types of models supported by the project, including their providers and API types<br>- Modifying this file should be avoided unless necessary, as it plays a fundamental role in the overall architecture of the project.## Project OverviewThe project's structure includes various directories and files, with the <code>models.ts</code> file residing in the <code>src\lib</code> directory<br>- This file specifically focuses on defining the structure of models used within the project, ensuring consistency and clarity in handling different types of models and their associated data<br>- The <code>Model</code> interface outlined in this file serves as a key component in the project's architecture, providing a blueprint for representing and working with models effectively.By adhering to the guidelines set forth in the <code>models.ts</code> file, developers can maintain a standardized approach to defining and utilizing models across the project<br>- Understanding the purpose and significance of this file is essential for ensuring the proper functioning and integration of various models within the projects ecosystem.</td>
						</tr>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='/src/lib/utils.ts'>utils.ts</a></b></td>
							<td style='padding: 8px;'>Define utility functions for generating gradients, formatting numbers, and combining CSS classes.</td>
						</tr>
					</table>
					<!-- ai Submodule -->
					<details>
						<summary><b>ai</b></summary>
						<blockquote>
							<div class='directory-path' style='padding: 8px 0; color: #666;'>
								<code><b>⦿ src.lib.ai</b></code>
							<table style='width: 100%; border-collapse: collapse;'>
							<thead>
								<tr style='background-color: #f8f9fa;'>
									<th style='width: 30%; text-align: left; padding: 8px;'>File Name</th>
									<th style='text-align: left; padding: 8px;'>Summary</th>
								</tr>
							</thead>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='/src/lib/ai/errors.ts'>errors.ts</a></b></td>
									<td style='padding: 8px;'>Generate AI-related error objects and format them for chat messages based on error codes and providers within the projects AI error handling module.</td>
								</tr>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='/src/lib/ai/service.ts'>service.ts</a></b></td>
									<td style='padding: 8px;'>- Manage AI adapters, model configurations, and retry logic for seamless AI interactions<br>- Initialize adapters, fetch model configurations, and handle retries for streaming and completion requests<br>- Merge model details into requests and handle errors gracefully<br>- Ensure reliable AI services with built-in and custom models.</td>
								</tr>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='/src/lib/ai/types.ts'>types.ts</a></b></td>
									<td style='padding: 8px;'>- Define types and interfaces for AI message content, tool calls, approval requests, errors, requests, and adapters within the AI system<br>- These structures facilitate communication between components, handle tool interactions, manage errors, and configure AI models.</td>
								</tr>
							</table>
							<!-- adapters Submodule -->
							<details>
								<summary><b>adapters</b></summary>
								<blockquote>
									<div class='directory-path' style='padding: 8px 0; color: #666;'>
										<code><b>⦿ src.lib.ai.adapters</b></code>
									<table style='width: 100%; border-collapse: collapse;'>
									<thead>
										<tr style='background-color: #f8f9fa;'>
											<th style='width: 30%; text-align: left; padding: 8px;'>File Name</th>
											<th style='text-align: left; padding: 8px;'>Summary</th>
										</tr>
									</thead>
										<tr style='border-bottom: 1px solid #eee;'>
											<td style='padding: 8px;'><b><a href='/src/lib/ai/adapters/anthropic-messages.ts'>anthropic-messages.ts</a></b></td>
											<td style='padding: 8px;'>- The Anthropic Messages Adapter class facilitates communication with Anthropic API, handling message formatting, system prompts, and MCP server interactions<br>- It supports streaming and message completion, incorporating model parameters and custom headers<br>- The adapter ensures seamless integration with Anthropic services for AI-driven message processing.</td>
										</tr>
										<tr style='border-bottom: 1px solid #eee;'>
											<td style='padding: 8px;'><b><a href='/src/lib/ai/adapters/base.ts'>base.ts</a></b></td>
											<td style='padding: 8px;'>- Define a base AI adapter with essential methods for handling AI requests and responses<br>- Implement functionalities for streaming data, error handling, and building request bodies<br>- Encapsulate header management and response processing logic<br>- This adapter serves as a foundational structure for AI integration within the projects architecture.</td>
										</tr>
										<tr style='border-bottom: 1px solid #eee;'>
											<td style='padding: 8px;'><b><a href='/src/lib/ai/adapters/gemini.ts'>gemini.ts</a></b></td>
											<td style='padding: 8px;'>- Implementing a Gemini AI adapter that supports streaming, this code file formats AI requests for the Gemini API<br>- It handles message content, image attachments, and chat sessions, utilizing Googles Generative AI for responses<br>- Additionally, it manages error formatting for the Gemini adapter.</td>
										</tr>
										<tr style='border-bottom: 1px solid #eee;'>
											<td style='padding: 8px;'><b><a href='/src/lib/ai/adapters/openai-chat-completions.ts'>openai-chat-completions.ts</a></b></td>
											<td style='padding: 8px;'>- Define a class that adapts OpenAI Chat Completions, supporting streaming<br>- Formats messages with image support and handles attachments<br>- Implements stream and complete methods to interact with OpenAI API<br>- Parses responses and errors accordingly, enhancing chat completion functionality.</td>
										</tr>
										<tr style='border-bottom: 1px solid #eee;'>
											<td style='padding: 8px;'><b><a href='/src/lib/ai/adapters/openai-responses.ts'>openai-responses.ts</a></b></td>
											<td style='padding: 8px;'>Supports streaming capabilities.-Manages response IDs for chaining.-Tracks and processes MCP tool calls and approval requests.-Handles reasoning accumulation for multiple summary parts.This adapter plays a vital role in integrating the project with the OpenAI Responses API, enabling seamless communication and data processing between the project and the OpenAI platform.</td>
										</tr>
									</table>
								</blockquote>
							</details>
							<!-- utils Submodule -->
							<details>
								<summary><b>utils</b></summary>
								<blockquote>
									<div class='directory-path' style='padding: 8px 0; color: #666;'>
										<code><b>⦿ src.lib.ai.utils</b></code>
									<table style='width: 100%; border-collapse: collapse;'>
									<thead>
										<tr style='background-color: #f8f9fa;'>
											<th style='width: 30%; text-align: left; padding: 8px;'>File Name</th>
											<th style='text-align: left; padding: 8px;'>Summary</th>
										</tr>
									</thead>
										<tr style='border-bottom: 1px solid #eee;'>
											<td style='padding: 8px;'><b><a href='/src/lib/ai/utils/retry.ts'>retry.ts</a></b></td>
											<td style='padding: 8px;'>- Implement a retry mechanism for asynchronous operations with customizable options<br>- Retry logic includes exponential backoff, jitter to prevent congestion, and handling retryable errors based on conditions like status codes and error messages<br>- The code enhances fault tolerance and resilience in handling transient failures within the projects AI utilities.</td>
										</tr>
									</table>
								</blockquote>
							</details>
						</blockquote>
					</details>
					<!-- clients Submodule -->
					<details>
						<summary><b>clients</b></summary>
						<blockquote>
							<div class='directory-path' style='padding: 8px 0; color: #666;'>
								<code><b>⦿ src.lib.clients</b></code>
							<table style='width: 100%; border-collapse: collapse;'>
							<thead>
								<tr style='background-color: #f8f9fa;'>
									<th style='width: 30%; text-align: left; padding: 8px;'>File Name</th>
									<th style='text-align: left; padding: 8px;'>Summary</th>
								</tr>
							</thead>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='/src/lib/clients/polar.ts'>polar.ts</a></b></td>
									<td style='padding: 8px;'>- Provide configured Polar SDK client instance and organization ID from environment variables<br>- Ensure POLAR_ACCESS_TOKEN and POLAR_ORGANIZATION_ID are set, throwing errors if not configured.</td>
								</tr>
							</table>
						</blockquote>
					</details>
					<!-- export Submodule -->
					<details>
						<summary><b>export</b></summary>
						<blockquote>
							<div class='directory-path' style='padding: 8px 0; color: #666;'>
								<code><b>⦿ src.lib.export</b></code>
							<table style='width: 100%; border-collapse: collapse;'>
							<thead>
								<tr style='background-color: #f8f9fa;'>
									<th style='width: 30%; text-align: left; padding: 8px;'>File Name</th>
									<th style='text-align: left; padding: 8px;'>Summary</th>
								</tr>
							</thead>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='/src/lib/export/chatterhub-export.ts'>chatterhub-export.ts</a></b></td>
									<td style='padding: 8px;'>- Export data from a messaging platform, including chats, messages, and images, into a structured zip file<br>- The code organizes data by folders and chat groups, creating metadata files for each chat group and exporting chat data with associated messages<br>- Image attachments are saved with metadata, ensuring a comprehensive export of messaging content.</td>
								</tr>
							</table>
						</blockquote>
					</details>
					<!-- import Submodule -->
					<details>
						<summary><b>import</b></summary>
						<blockquote>
							<div class='directory-path' style='padding: 8px 0; color: #666;'>
								<code><b>⦿ src.lib.import</b></code>
							<table style='width: 100%; border-collapse: collapse;'>
							<thead>
								<tr style='background-color: #f8f9fa;'>
									<th style='width: 30%; text-align: left; padding: 8px;'>File Name</th>
									<th style='text-align: left; padding: 8px;'>Summary</th>
								</tr>
							</thead>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='/src/lib/import/chatgpt-import.ts'>chatgpt-import.ts</a></b></td>
									<td style='padding: 8px;'>- SummaryThe <code>chatgpt-import.ts</code> file in the <code>src\lib\import</code> directory is responsible for handling the import functionality related to ChatGPT conversations<br>- It defines interfaces for ChatGPT exports, conversations, nodes, messages, and import options<br>- This code facilitates the importing of conversations along with their metadata, such as titles, timestamps, authors, content, and associated models, into the system<br>- Additionally, it manages the mapping of conversations and their hierarchical structure, enabling the seamless integration of ChatGPT data into the project's database.By utilizing this file, developers can efficiently import ChatGPT conversations, along with their associated information, enhancing the projects capabilities in handling and processing conversational data.</td>
								</tr>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='/src/lib/import/chatterhub-import.ts'>chatterhub-import.ts</a></b></td>
									<td style='padding: 8px;'>- Parse and import chat data from a zip file, creating new structures in the database<br>- Handles folder creation, chat group import, message migration, and attachment handling<br>- Provides progress tracking and error handling for a seamless import process.</td>
								</tr>
							</table>
						</blockquote>
					</details>
					<!-- pwa Submodule -->
					<details>
						<summary><b>pwa</b></summary>
						<blockquote>
							<div class='directory-path' style='padding: 8px 0; color: #666;'>
								<code><b>⦿ src.lib.pwa</b></code>
							<table style='width: 100%; border-collapse: collapse;'>
							<thead>
								<tr style='background-color: #f8f9fa;'>
									<th style='width: 30%; text-align: left; padding: 8px;'>File Name</th>
									<th style='text-align: left; padding: 8px;'>Summary</th>
								</tr>
							</thead>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='/src/lib/pwa/serviceWorker.ts'>serviceWorker.ts</a></b></td>
									<td style='padding: 8px;'>- Register, update, and check status<br>- Handles registration, updates, and controller changes<br>- Supports service worker registration and unregistration<br>- Provides status on support, registration, and controller presence.</td>
								</tr>
							</table>
						</blockquote>
					</details>
					<!-- services Submodule -->
					<details>
						<summary><b>services</b></summary>
						<blockquote>
							<div class='directory-path' style='padding: 8px 0; color: #666;'>
								<code><b>⦿ src.lib.services</b></code>
							<table style='width: 100%; border-collapse: collapse;'>
							<thead>
								<tr style='background-color: #f8f9fa;'>
									<th style='width: 30%; text-align: left; padding: 8px;'>File Name</th>
									<th style='text-align: left; padding: 8px;'>Summary</th>
								</tr>
							</thead>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='/src/lib/services/openrouter.ts'>openrouter.ts</a></b></td>
									<td style='padding: 8px;'>- Define and fetch OpenRouter models, format pricing, filter and sort models, map parameters, and detect model capabilities<br>- The OpenRouterService class in openrouter.ts interacts with the OpenRouter API to manage model data efficiently within the projects architecture.</td>
								</tr>
							</table>
						</blockquote>
					</details>
					<!-- utils Submodule -->
					<details>
						<summary><b>utils</b></summary>
						<blockquote>
							<div class='directory-path' style='padding: 8px 0; color: #666;'>
								<code><b>⦿ src.lib.utils</b></code>
							<table style='width: 100%; border-collapse: collapse;'>
							<thead>
								<tr style='background-color: #f8f9fa;'>
									<th style='width: 30%; text-align: left; padding: 8px;'>File Name</th>
									<th style='text-align: left; padding: 8px;'>Summary</th>
								</tr>
							</thead>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='/src/lib/utils/base64.ts'>base64.ts</a></b></td>
									<td style='padding: 8px;'>- Converts ArrayBuffer to base64 string safely, handling large buffers to prevent stack overflow<br>- Processed in 32KB chunks for efficiency<br>- Located in src\lib\utils\base64.ts within the project structure.</td>
								</tr>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='/src/lib/utils/copyUtils.ts'>copyUtils.ts</a></b></td>
									<td style='padding: 8px;'>- Extracts plain text from markdown content while preserving structure<br>- Removes markdown formatting like headers, lists, code blocks, and images<br>- Provides functions to preserve full markdown content and copy text to the clipboard with error handling<br>- These utilities enhance the user experience by simplifying content manipulation and enabling easy copying.</td>
								</tr>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='/src/lib/utils/index.ts'>index.ts</a></b></td>
									<td style='padding: 8px;'>Expose math utility functions for wider usage within the projects codebase architecture.</td>
								</tr>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='/src/lib/utils/math.ts'>math.ts</a></b></td>
									<td style='padding: 8px;'>- Calculate cosine similarity between two vectors for comparing document or feature vector similarity<br>- Handles null/undefined values as 0<br>- Computes dot product and magnitudes to derive similarity value between-1 and 1<br>- Ideal for assessing vector relationships.</td>
								</tr>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='/src/lib/utils/mcp-tools.ts'>mcp-tools.ts</a></b></td>
									<td style='padding: 8px;'>- Fetches MCP server tools via a proxy API to handle CORS issues and support JSON/SSE responses<br>- Validates MCP server URLs and provides an option to listen for live tool list changes<br>- Handles various error scenarios for robust error management.</td>
								</tr>
							</table>
						</blockquote>
					</details>
				</blockquote>
			</details>
			<!-- pages Submodule -->
			<details>
				<summary><b>pages</b></summary>
				<blockquote>
					<div class='directory-path' style='padding: 8px 0; color: #666;'>
						<code><b>⦿ src.pages</b></code>
					<table style='width: 100%; border-collapse: collapse;'>
					<thead>
						<tr style='background-color: #f8f9fa;'>
							<th style='width: 30%; text-align: left; padding: 8px;'>File Name</th>
							<th style='text-align: left; padding: 8px;'>Summary</th>
						</tr>
					</thead>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='/src/pages/index.tsx'>index.tsx</a></b></td>
							<td style='padding: 8px;'>- The <code>index.tsx</code> file in the <code>src\pages</code> directory plays a crucial role in the projects architecture<br>- It orchestrates various functionalities such as managing chat operations, updating activities, handling drafts, and providing layout components for the dashboard<br>- Additionally, it integrates with context providers for licenses, API keys, and settings<br>- This file serves as the entry point for rendering the dashboard layout, chat sidebar, navigation sidebar, and modals<br>- Overall, <code>index.tsx</code> acts as a central hub for coordinating essential features and components within the project.</td>
						</tr>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='/src/pages/mcp-servers.tsx'>mcp-servers.tsx</a></b></td>
							<td style='padding: 8px;'>- Define and manage MCP servers for AI model interactions with external tools and services<br>- Enable real-time web search, database access, API integrations, and more through pre-configured and custom servers<br>- Add, update, delete, and toggle server status effortlessly within a user-friendly interface.</td>
						</tr>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='/src/pages/models.tsx'>models.tsx</a></b></td>
							<td style='padding: 8px;'>- Models Page ContentThe <code>models.tsx</code> file in the <code>src/pages</code> directory is a crucial component of the project's architecture<br>- This file is responsible for rendering the Models page content, which includes displaying various models, allowing users to interact with custom models, and providing settings for model parameters.The Models Page Content utilizes React components to create an interactive user interface, enabling users to view, select, and customize different models<br>- It leverages context providers to manage licenses, API keys, and settings for a seamless user experience.Additionally, the file integrates with external libraries like <code>lucide-react</code> for icons and <code>dexie-react-hooks</code> for database queries<br>- It also includes functionalities for displaying notifications using <code>react-hot-toast</code> and optimizing images with <code>next/image</code>.Overall, the <code>models.tsx</code> file plays a vital role in the project by offering a rich user interface for exploring and interacting with various models, enhancing the overall functionality and user engagement of the application.</td>
						</tr>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='/src/pages/privacy.mdx'>privacy.mdx</a></b></td>
							<td style='padding: 8px;'>- Define the purpose of the <code>privacy.mdx</code> page in the project architecture<br>- It serves as the Privacy Policy page for ChatterHub, outlining data collection, storage practices, and user rights<br>- The page clarifies information handling, emphasizing local data storage and limited data retention<br>- Contact details for inquiries are provided, ensuring transparency and user communication.</td>
						</tr>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='/src/pages/prompts.tsx'>prompts.tsx</a></b></td>
							<td style='padding: 8px;'>- Manage and create AI conversation prompts with ease using the PromptsPageContent function<br>- This code segment allows users to organize, filter, import, and customize prompts efficiently<br>- It provides a user-friendly interface to handle various prompt-related actions, enhancing the overall prompt management experience within the project architecture.</td>
						</tr>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='/src/pages/settings.tsx'>settings.tsx</a></b></td>
							<td style='padding: 8px;'>- Manage API keys, preferences, and settings within the SettingsPageContent function<br>- Display different tabs for API keys, speech, import/export, advanced settings, and about information<br>- The function integrates with various contexts and components to provide a comprehensive settings management interface.</td>
						</tr>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='/src/pages/support.tsx'>support.tsx</a></b></td>
							<td style='padding: 8px;'>Define the support page for ChatterHub, displaying contact information for users.</td>
						</tr>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='/src/pages/terms.mdx'>terms.mdx</a></b></td>
							<td style='padding: 8px;'>- SummaryThe <code>terms.mdx</code> file, located in the <code>src\pages</code> directory, is a crucial component of the ChatterHub projects architecture<br>- This file defines the structure and content for the Terms of Service page displayed within the ChatterHub mobile application<br>- It sets the title of the page, provides information about the last update, and outlines the agreement between the user and Ray Amjad LTD regarding the use of the ChatterHub services<br>- By encapsulating this legal information in a clear and concise manner, the <code>terms.mdx</code> file ensures that users are informed about their rights and responsibilities when using the ChatterHub application.</td>
						</tr>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='/src/pages/_app.tsx'>_app.tsx</a></b></td>
							<td style='padding: 8px;'>- Implement a React component for the ChatterHub app, managing the layout, theme, service worker registration, and analytics<br>- It orchestrates the rendering of the main content, encapsulated within a RootLayout component, and includes an InstallPrompt for PWA functionality<br>- The component sets the page title and ensures service worker registration on mount.</td>
						</tr>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='/src/pages/_document.tsx'>_document.tsx</a></b></td>
							<td style='padding: 8px;'>- Define the global metadata for the ChatterHub website, including SEO properties, social media tags, and icons<br>- This document sets the foundation for search engine optimization and social media sharing, enhancing the sites visibility and branding.</td>
						</tr>
					</table>
					<!-- api Submodule -->
					<details>
						<summary><b>api</b></summary>
						<blockquote>
							<div class='directory-path' style='padding: 8px 0; color: #666;'>
								<code><b>⦿ src.pages.api</b></code>
							<table style='width: 100%; border-collapse: collapse;'>
							<thead>
								<tr style='background-color: #f8f9fa;'>
									<th style='width: 30%; text-align: left; padding: 8px;'>File Name</th>
									<th style='text-align: left; padding: 8px;'>Summary</th>
								</tr>
							</thead>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='/src/pages/api/checkout.ts'>checkout.ts</a></b></td>
									<td style='padding: 8px;'>- Enable seamless checkout process by configuring Checkout component with access token, success, and return URLs<br>- Dynamically set the server based on the environment to ensure smooth transactions.</td>
								</tr>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='/src/pages/api/mcp-proxy.ts'>mcp-proxy.ts</a></b></td>
									<td style='padding: 8px;'>- Implement an API proxy in the MCP project to fetch tools data from a specified URL<br>- Handles POST requests, validates input, and processes JSON responses<br>- Manages authentication, error handling, and content types<br>- Ensures robust communication with the MCP server, providing detailed error messages for various scenarios.</td>
								</tr>
							</table>
							<!-- license Submodule -->
							<details>
								<summary><b>license</b></summary>
								<blockquote>
									<div class='directory-path' style='padding: 8px 0; color: #666;'>
										<code><b>⦿ src.pages.api.license</b></code>
									<table style='width: 100%; border-collapse: collapse;'>
									<thead>
										<tr style='background-color: #f8f9fa;'>
											<th style='width: 30%; text-align: left; padding: 8px;'>File Name</th>
											<th style='text-align: left; padding: 8px;'>Summary</th>
										</tr>
									</thead>
										<tr style='border-bottom: 1px solid #eee;'>
											<td style='padding: 8px;'><b><a href='/src/pages/api/license/activate.ts'>activate.ts</a></b></td>
											<td style='padding: 8px;'>- Implement a license activation endpoint that interacts with Polars API<br>- Validates and activates a license key, handling errors like missing fields, configuration issues, and activation limits<br>- Returns activation details upon success, or appropriate error messages.</td>
										</tr>
										<tr style='border-bottom: 1px solid #eee;'>
											<td style='padding: 8px;'><b><a href='/src/pages/api/license/validate.ts'>validate.ts</a></b></td>
											<td style='padding: 8px;'>- Validate license keys and activation information using Polars API<br>- This code ensures license key validity, expiration checks, and usage limits<br>- It handles various scenarios like expired licenses, rate limiting, and specific API errors<br>- Returns customer data for valid licenses and appropriate error messages for invalid or problematic cases.</td>
										</tr>
									</table>
								</blockquote>
							</details>
						</blockquote>
					</details>
				</blockquote>
			</details>
			<!-- styles Submodule -->
			<details>
				<summary><b>styles</b></summary>
				<blockquote>
					<div class='directory-path' style='padding: 8px 0; color: #666;'>
						<code><b>⦿ src.styles</b></code>
					<table style='width: 100%; border-collapse: collapse;'>
					<thead>
						<tr style='background-color: #f8f9fa;'>
							<th style='width: 30%; text-align: left; padding: 8px;'>File Name</th>
							<th style='text-align: left; padding: 8px;'>Summary</th>
						</tr>
					</thead>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='/src/styles/globals.css'>globals.css</a></b></td>
							<td style='padding: 8px;'>- Define global styles for the project, including scrollbar customization, color variables, typography settings, and ProseMirror styling<br>- Ensure consistent design across components with Tailwind CSS utilities<br>- Customize scrollbars, define color palettes, and style text elements for a cohesive user interface.</td>
						</tr>
					</table>
				</blockquote>
			</details>
			<!-- utils Submodule -->
			<details>
				<summary><b>utils</b></summary>
				<blockquote>
					<div class='directory-path' style='padding: 8px 0; color: #666;'>
						<code><b>⦿ src.utils</b></code>
					<table style='width: 100%; border-collapse: collapse;'>
					<thead>
						<tr style='background-color: #f8f9fa;'>
							<th style='width: 30%; text-align: left; padding: 8px;'>File Name</th>
							<th style='text-align: left; padding: 8px;'>Summary</th>
						</tr>
					</thead>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='/src/utils/colors.ts'>colors.ts</a></b></td>
							<td style='padding: 8px;'>- Generate a variety of harmonious pastel colors for UI elements by mixing, darkening, and complementing base colors<br>- Achieve soft, subtle shades for backgrounds, borders, titles, and subtitles to enhance visual appeal and readability<br>- Improve color contrast in light and dark modes by dynamically adjusting color tones.</td>
						</tr>
					</table>
				</blockquote>
			</details>
		</blockquote>
	</details>
</details>

---

## Getting Started

### Prerequisites

This project requires the following dependencies:

- **Programming Language:** TypeScript
- **Package Manager:** Npm

### Installation

Build  from the source and intsall dependencies:

1. **Clone the repository:**

    ```sh
    ❯ git clone ../
    ```

2. **Navigate to the project directory:**

    ```sh
    ❯ cd 
    ```

3. **Install the dependencies:**

<!-- SHIELDS BADGE CURRENTLY DISABLED -->
	<!-- [![npm][npm-shield]][npm-link] -->
	<!-- REFERENCE LINKS -->
	<!-- [npm-shield]: https://img.shields.io/badge/npm-CB3837.svg?style={badge_style}&logo=npm&logoColor=white -->
	<!-- [npm-link]: https://www.npmjs.com/ -->

	**Using [npm](https://www.npmjs.com/):**

	```sh
	❯ npm install
	```

### Usage

Run the project with:

**Using [npm](https://www.npmjs.com/):**
```sh
npm start
```

### Testing

 uses the {__test_framework__} test framework. Run the test suite with:

**Using [npm](https://www.npmjs.com/):**
```sh
npm test
```

---

## Contributing

- **💬 [Join the Discussions](https://LOCAL///discussions)**: Share your insights, provide feedback, or ask questions.
- **🐛 [Report Issues](https://LOCAL///issues)**: Submit bugs found or log feature requests for the `` project.
- **💡 [Submit Pull Requests](https://LOCAL///blob/main/CONTRIBUTING.md)**: Review open PRs, and submit your own PRs.

<details closed>
<summary>Contributing Guidelines</summary>

1. **Fork the Repository**: Start by forking the project repository to your LOCAL account.
2. **Clone Locally**: Clone the forked repository to your local machine using a git client.
   ```sh
   git clone .
   ```
3. **Create a New Branch**: Always work on a new branch, giving it a descriptive name.
   ```sh
   git checkout -b new-feature-x
   ```
4. **Make Your Changes**: Develop and test your changes locally.
5. **Commit Your Changes**: Commit with a clear message describing your updates.
   ```sh
   git commit -m 'Implemented new feature x.'
   ```
6. **Push to LOCAL**: Push the changes to your forked repository.
   ```sh
   git push origin new-feature-x
   ```
7. **Submit a Pull Request**: Create a PR against the original project repository. Clearly describe the changes and their motivations.
8. **Review**: Once your PR is reviewed and approved, it will be merged into the main branch. Congratulations on your contribution!
</details>

---

## License

 is protected under the [LICENSE]([https://choosealicense.com/licenses](https://choosealicense.com/licenses/mit/) License. For more details, refer to the [LICENSE](https://github.com/ebcodev/ChatterHub/blob/main/LICENSE) file.

</div>
