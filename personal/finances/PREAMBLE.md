
# Slept On It (SOI)

1. Have Claude Evaluate https://docs.google.com/spreadsheets/d/13l0Tzxi6qNjb-iofmoLnU5COrrRLz6Yv6It7XxpMqks/edit?gid=559590668#gid=559590668 

2. Have Claude Help me Create the Plan to create a fully architected cashflow analysis tool, we'll need to understand how it fits in to our future.

  * The Use Case Brain Storm Session 
  * The Scope of Integration and Import/Export (i.e. interface with my bank's apis or web screenscrape');
  * 


# Thinking out Loud
Get my lenny.l.miller@gmail.com account setup so I can, via the terminal and/or vs code pull code down, manage it in github, and then push it , research what are common best practices, and find out

I've done the following research;

basically it states to use a 

```
npm install -g @google/clasp
```

Wrinkle for my environment is I use Nix, and you can find the flake.nix file in the ~/.config/nix/ folder.

so be sure to follow the patterned I've established using Homebrew in Nix. But first check to see if Nix's package manager supports it ... do enough research to be sure, as I would rather manage our packages via nix 100%.. 

But 

Research Creation workflow... I think my ideal workflow will be as follows.

The story: As a Man managing his personal finance, I created a Google Sheet that I use to keep me clear on how much or little each month.. and I call this spreadsheet every day...  and now I'm finding that I really want to create a standalone engine that I can create multiple views on the data, this became very apparent when I started using the spreadsheet and I had to decide to take a second job or not, so I just used a specific cell (true/false) that I would then adjust downstream, and as I paid that monts, my process would be to replace the formula in that cell  with the actual.. so in a sense, the spreadsheed morphes from proected to reality, and I'm finding more clarity and the more I use it the more I realize I want a  little engine that we can use. and maybe when were done we can have a stand alone web spa app that has a grid and we can manipulate the data, one example of a what if scenario that I want to do sooner than later is   if the house sells in , and add different color data points on the graph to represent the what if .. 


For instance, I am trying to decide to take a second job, the original line would indicate to me what my sitation would be like if I took a second job, and the paydays are projected out. etc. 






## Initial Thoughts
create a project for financial tools and work it into our current ~/projects/ folder, in this case it would be the ~/projects/personal/finances/cashflow-analysis