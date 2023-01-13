import { Injectable } from '@angular/core';
import {preamble} from "./preamble";

@Injectable({
  providedIn: 'root'
})
export class LatexService {

  constructor() {
  }

  private preamble = preamble.preamble; // get the default preamble


public convertToLatex(name: string, markdown: string, lastModified: number) {
      const date = new Date(lastModified);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const dateString = `${year}-${month}-${day}`;
      this.preamble += "\\title{" + name + "}\n" + "\\date{" + dateString + "}\n" + "\\begin{document}\n" + "\\maketitle\n";

    let latex = this.preamble;

    // Split the Markdown document into lines
    const lines = markdown.split('\n');

    // Iterate through each line
    let insideCodeBlock = false;
    let insideTable = false;
    let insideItemize = false;
    let insideEnumerate = false;
    for (const line of lines) {
      // Check if the line is a code block
      if (line.startsWith('```')) {
        if (insideCodeBlock) {
          // End the code block
          latex += '\\end{lstlisting}\n';
          insideCodeBlock = false;
        } else {
          // Start a new code block
          latex += '\\begin{lstlisting}';
          insideCodeBlock = true;
          // if there is a language specified, use it
          let language = line.split('```')[1];
          if (language) {
             // remove the new line from language if it exists
            language = language.replace('\n', '');
            latex += '\\lstset{language=' + language + '}\n';
          } else {
            latex += '\n';
          }
        }
      } else if (insideCodeBlock) {
        // Add the line to the code block
        latex += line + '\n';
      } else if (line.startsWith('|')) {
        if (insideTable) {
          if (line.startsWith('|---')) {
            // Add a horizontal line to the table
            latex += '\\hline\n';
          } else {
            // Add the line to the table
            latex += this.convertTableLine(line) + ' \\\\\n';
          }
        } else {
          // Start a new table
          latex += '\\begin{longtable}{|';
          const cells = line.split('|');
          for (let i = 0; i < cells.length; i++) {
            latex += 'c|';
          }
          latex += '}\n';
          latex += this.convertTableLine(line) + ' \\\\\n';
          insideTable = true;
        }
      } else if (insideTable) {
        // End the table
        latex += '\\end{longtable}\n';
        insideTable = false;
      } else if (line.match(/^\s*[-*]/)) {
        // this means we are in an itemized list -- NOTE that we are not doing any recursive lists and are just flattening them
        if (insideItemize) {
          latex += '\\item ' + line.substring(1).trim() + '\n';
        } else {
          latex += '\\begin{itemize}\n';
          latex += '\\item ' + line.substring(1).trim() + '\n';
          insideItemize = true;
        }
      } else if (insideItemize) {
        latex += '\\end{itemize}\n';
        insideItemize = false;
      } else if (line.match(/^[ \t]*\d+\./)) {
        // this means we are in an enumerated list -- NOTE that we are not doing any recursive lists and are just flattening them
        if (insideEnumerate) {
          latex += '\\item ' + line.substring(2).trim() + '\n';
        } else {
          latex += '\\begin{enumerate}\n';
          latex += '\\item ' + line.substring(2).trim() + '\n';
          insideEnumerate = true;
        }
      } else if (insideEnumerate) {
        latex += '\\end{enumerate}\n';
        insideEnumerate = false;
      } else {
        // Convert the line to LaTeX
        latex += this.convertLine(line) + '\n';
      }
    }
    latex += '\\end{document}';
    return latex;
  }

  private convertLine(line: string): string {
    // Convert Markdown emphasis (italic and bold) to LaTeX emphasis
    line = line.replace('/**(.+?)**/g', '\textbf{$1}');
    line = line.replace('/*(.+?)*/g', '\textit{$1}');
    // Convert Markdown headings to LaTeX headings
    if (line.startsWith('#')) {
      const level = line.split('#').length - 1;
      line = line.replace(/^#+/, '').trim();
      line = `\\${'sub'.repeat(level-1)}section{${line}}`;
    }
    // TODO convert quotes into quote blocks

    // Convert Markdown links to LaTeX links
    line = line.replace(/\[(.+?)\]\((.+?)\)/g, '\\href{$2}{$1}');
    // Convert Markdown images to LaTeX images
    line = line.replace(/!\[(.+?)\]\((.+?)\)/g, '\\includegraphics{$2}');
    // remove ! from the beginning of the line (if it exists)
    line = line.replace(/^!/, '');
    // Convert Markdown horizontal lines to LaTeX horizontal lines
    if (line.startsWith('---')) {
      line = '\\hrule';
    }
    // convert comments to LaTeX comments
    // comments are in the form of [//]: # (comment)
    line = line.replace(/\[\/\/\]: # \((.+?)\)/g, '% $1');
    return line;
  }

  private convertTableLine(line: string): string {
    const cells = line.split('|');
    const latexCells = cells.map(cell => cell.trim()).map(cell => {
      if (cell.startsWith('$$') && cell.endsWith('$$')) {
// Convert the cell to a LaTeX equation
        return cell.substring(2, cell.length - 2);
      } else {
// Convert the cell to plain text
        return cell;
      }
    });
    // Return the LaTeX cells as a row
    return ' & '.repeat(latexCells.length - 1) + latexCells.join(' & ');
  }

  public getPreamble() {
  return this.preamble;
  }

  public setPreamble(preamble: string) {
  this.preamble = preamble;
  }
}
