# Jotmark

Jotmark is a Typescript web application developed using the Angular framework. It provides a simple and efficient way to jot down and manage Markdown based notes. Its user interface was inspired by Google Keep, and supports features such as note tags, rendering LaTeX math, images, and translating Markdown documents to LaTeX. 

## Features

Jotmark allows you to write short, auto-compiled Markdown notes, making it easy to format your content quickly and effortlessly.

- **Tagging**: Each note can be assigned one or multiple tags, enabling you to categorize your notes for better organization and retrieval.
- **Tag Filtering and Colouring**: You can filter notes based on tags, and assign a colour to each tag. A note will inherit its primary tag colour.
- **Sorting**: A user can sort notes either by name or by the last modified date, making it convenient to find the note needed.
- **Note Pinning**: You can pin notes to the top, such that they don't get lost when dealing with a large number of notes. 
- **LaTeX Math and Image Support**: Jotmark supports rendering LaTeX math equations and including images within your notes, enabling the user to create rich and visually appealing content.
- **LaTeX Conversion**: You can convert your Markdown notes to LaTeX and export all your notes as a zip file, either in LaTeX or Markdown format. This allows for more convenient writing of LaTeX documents
- **Save / Load**: You can load either a single note or a directory of notes, and save individual Markdown notes or save all as a zip. Note tags and colours are persistent across the saving and loading process, as the data is stored within the document itself in a non-rendered comment.

## Getting Started

You can visit the project online at [https://jotmark.web.app/](https://jotmark.web.app/), or you can run it locally by cloning the repository, installing dependencies by running `npm install`, and building + launching the application by running `ng build` and then `ng serve`. 

## Drawbacks and Limitations

Jotmark was not implemented using asynchronous code, which means that rendering large amounts of text leads to a much slower user experience. The app was not optimized to smartly render an update when the user types, and the entire document is re-rendered. Such hindrances make the app less useful for large documents and use cases, including class notes. 

The application is no longer maintained, and as a result there are no planned improvements to address these limitations in the future. 
