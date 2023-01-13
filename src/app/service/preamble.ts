export const preamble = {
  preamble: "% default preamble for LaTeX document; the user can overwrite this in their own preamble. The default preamble is:\n\
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
"
}
