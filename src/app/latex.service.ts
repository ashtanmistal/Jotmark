import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class LatexService {

  constructor(private http: HttpClient) {
  }

  private preamble = "% default preamble for LaTeX document; the user can overwrite this in their own preamble. The default preamble is:\n\
\\documentclass[11pt,fleqn]{exam}\n\
\\usepackage[utf8]{inputenc}\n\
\\usepackage[T1]{fontenc}\n\
\\usepackage{fancyvrb}\n\
\\usepackage{amsmath}\n\
\\usepackage{amssymb}\n\
\\usepackage{hyperref}\n\
\\usepackage{listings}\n\
\\usepackage{algpseudocode}\n\
\\usepackage{tikz}\n\
\\usepackage{esint} % needed for \\oiint\n\
\\usepackage{amsthm  }\n\
\\usepackage[margin=0.98in]{geometry}\n\
\\usepackage{graphicx}\n\
\\usepackage{pdfpages}\n\
\\usepackage{standalone}\n\
\\usepackage{titling}\n\
\\usepackage{braket}\n\
\\usepackage{float}\n\
\\usepackage{color}\n\
\\usetikzlibrary{arrows,arrows.meta,positioning,intersections,shapes.gates.logic.US,calc}\n\
\\algnewcommand\\algorithmicforeach{\\textbf{for each}}\n\
\\algdef{S}[FOR]{ForEach}[1]{\\algorithmicforeach\ #1\ \\algorithmicdo}\n\
\\newcommand{\\fillinMCmath}[1]{\\begin{tikzpicture}\\draw circle [radius=0.5em];\\end{tikzpicture}\ #1}\n\
\\newcommand{\\fillinMCmathsoln}[1]{\\begin{tikzpicture}\\draw[black, fill=blue] circle [radius=0.5em];\\end{tikzpicture} #1}\n\
\\restylefloat{table}\n\
\\newcommand{\\NN}{\\mathbb{N}} % Naturals\n\
\\newcommand{\\ZZ}{\\mathbb{Z}} % Integers\n\
\\newcommand{\\QQ}{\\mathbb{Q}} % Rationals\n\
\\newcommand{\\RR}{\\mathbb{R}} % Reals\n\
\\newcommand{\\CC}{\\mathbb{C}} % Imaginaries\n\
\\newcommand{\\HH}{\\mathbb{H}} % Quaternions\n\
\\newcommand{\\FF}{\\mathbb{F}} % Field\n\
\\newcommand{\\CoulombConstant}{\\frac{1}{4\\pi\\epsilon_0}}\n\
\\DeclareMathOperator{\\erf}{erf} % Error Function\n\
\\DeclareMathOperator{\\erfc}{erfc} % Complementary Error Function\n\
\\DeclareMathOperator{\\erfi}{erfi} % Imaginary Error Function\n\
\\DeclareMathOperator{\\row}{row} % Matrix Row\n\
\\DeclareMathOperator{\\col}{col} % Matrix Column\n\
\\DeclareMathOperator{\\trace}{tr} % Matrix Trace\n\
\\DeclareMathOperator{\\\proj}{proj} % Vector Projection\n\
\\DeclareMathOperator{\\curl}{curl}\n\
\\DeclareMathOperator{\\grad}{grad}\n\
\\DeclareMathOperator{\\divg}{div}\n\
\\definecolor{solnblue}{rgb}{0,0,1}\n\
\\newenvironment{soln}{\\color{solnblue}}{}\n\
\\bracketedpoints\n\
\\renewenvironment{solution}{\leavevmode\\par\\begin{soln}\\noindent Solution:}{\\end{soln}}\n\
\\newif\\ifsolutions\\solutionsfalse\n\
";


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
  
  }
