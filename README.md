TODO: Add usable new project users , so cursor and/or vs-code users wanting to read my Analysis Prompt Use Case analysis reports.
# Current Thinking

❯ tree -L 3
```bash
├── global
│   └── plantuml-server (TODO: Add to README, why, how, and notes)
│       ├── bin
│       ├── data
│       ├── docs
│       ├── examples
│       ├── IMPLEMENTATION_SUMMARY.md
│       ├── README.md
│       ├── shell.nix
│       └── vscode-settings.json
├── jha
│   ├── banno-online
│   │   └── WEB-1 // symbolic link to ../../tickets/WEB-14
│   ├── platform-ux
│   │   └── WEB-14 // symbolic link to ../../tickets/WEB-14  
│   ├── responsive-tiles
│   ├── tickets(TODO: Add to README, we manually symbolic link, LOW BAR FOR AUTOMATION, NOTE 2 )
│   └── web-server
│       └── WEB-14 // symbolic link to ../../tickets/WEB-14
├── Nixify.md
├── personal
│   ├── pfm-platform
│   │   └── INA-1 // symbolic link to ../../tickets/INA-1
│   └── pfm-research
│       └── INA-4 // symbolic link to ../../tickets/INA-4
├── tickets
    ├── INA-1
    ├── INA-2
    ├── INA-3
│   ├── INA-4
│   ├── INA-5
│   ├── WEB-1
│   ├── WEB-2
│   ├── WEB-3
│   ├── WEB-4
│   ├── WEB-5
│   ├── WEB-6
│   ├── WEB-7
│   ├── WEB-8
│   ├── WEB-9
│   ├── WEB-10
│   ├── WEB-11
│   ├── WEB-12
│   ├── WEB-13
│   └── WEB-14
├── README.md
└── VISON.md
```
##1##


# Notes

## Note 1
  ### SymLinksBootstrap
This is an idea, since we're working on being able to swap in and out of environments in a moment, we'll make a rule that there can only be one symbolic link allowed at a time unless there is an override done one instance at a time (case by case bases, and the user will explicitly use a different command that normal)
Long Term: Ability to swap out environments, and combine environments???...

# Use Case Analysis
Much like we have when we created keybinds to start kitty and ghostty... Let's create a floating window that can be brought up with a specific keybind.  In the context to SymLinksBootstrap we can use it to select, per project, what symbolic links we want active.




## Use Cases 
### Begin using SymLinksBootstrap
### Create a new ticket
 The idea is to create the name of the ticket in jira in the tickets folder under each project 
### Choose Project and ticket



## Actor: Developer
### Context: Never used the `projects` project, initiating for the first time...  
  **LONG TERM we'll have some installation procedure, etc.. for the sake of short term need, i'll only focus on SymLinksBootstrap Use Cases**




## Note 2
This could use shell.nix to work just like plantuml-server, when you navigate into the folder it boots up , and then when I run start 




# Analysis 

## PRE-CONDITION: 
## STORY:

When I press `shift + cmd + t` , I want a modal popup to appear, the purpose of this popup is to allow me to manage the Projects project.
   1. Create New Ticket (LLM ticket not Jira Ticket)
     FUZZY THINKING: 


### Loose but fun.

I want to turn a switch and have a fully R&D environment 

# Developer Workflow

I get assigned a task, sometimes it has a ticket, othertimes it does not, but I'll end up creating. So for the ssakeof this process, let's assume we have a ticket.

Pre-Condition: A Jira Ticket in the form WEB-XXXX has been created, and appropriately linked and referenced in parent/peer jira tickets.

Data-Gathering:
1. Create a folder in the ~/projects/tickets/WEB-XXXX
2. Create a REQUIREMENTS.md, Initially it's free form, just think outloud, past scraps from slack, write notes to include when you talk to AI, like have the AI open the github project to analyzed code organization. The point is# projects
