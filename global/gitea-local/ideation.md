




Starting State:

Github:Repo-Original on Branch-1

1. user adds a new component which includes 5 files for the component and 2 to support test component and 3 files 2 for integration and 1 for readme update;


TODO: Draw nice image showing this

2. User is noticing this same pattern has been used, and he wants to dabble on a general solution and Enters the switch command

3. System
  ??? do I behind the scenes stash these, add , the mystery is I can not determine how people use stash 

IDEALLY
   Before we do anything, take note of current 7 new files and 3 updates, and assuming switching to gitea can be done while in place in the same folder, and this can be done seemlessly and safe...     

TLDR;   if the user doesn't promote anything out of gitea and closes out and/or cancels right now I want the requirement to be that the Developer is right back with 7 new 3 updated.

NAIVELY, I was thinking we could
  a. re-orgin from github to gitea
  b. Then here have a script run keeping take state, and remember were in gitea in a new nix-shell, so skies the limit with what kind of power we want to wield


The on requirement that the developer when he doesn't promote and switches back is left in the exact same spot.

 Naively, if you just switched from Github to Gitea and left them as is, wouldn't the developer be responsible


====> AFTER SWITCH-INITIAL

| Time Index | Activity | Notes |
| 1 | Gitea : Repo-Original | New |
| 2 | Gitea : Intake | Prepares and somehow records state of Repo-Original |


Intake... this is where I would "Record the state of 7 New 3 Modified"


| 3 | Developer : Works | removes two of the 7 files, and makes modifications to 3)


SCENARIO 1 - Developer switches back without promotion:


| 4 | Developer is back to exact place before switching



SCENARIO 2 - Developer switches back after promoting

| 4 | Gitea create a promoted branch which will represent exactly what the developer worked on, and be able to quickly 
| 4.1 | Gitea: commit changes to promoted branch
| 4.2 | Gitea: ask the Developer Y/n
| 4.3 | SYSTEM SWITCH-BACK
| 5 | Developer Accepts (Y/n: Y)
| 6 | Github: somehow knows to use the or somehow reconcile what is being promoted by assuming doing a diff and patching 

Ok, so you see, 

I was thinking in the Gitea side, while the developer works, we dont' have to mirror how we use and think about it on github, what I believe we can do is leverage or borrow ideas from a github workflow


   



Let's talk about promotion, I had a thought while driving to get some Marijuana joints,                                               
                                                                                                                                        
  Seemless to me, at this early and naive stage means same directory                                                                    
                                                                                                                                        
  I've been struggling separating the what from the how, so for now until I tell you otherwise I mixing a bunch of thought to see if    
  you can help me grab my ideas and bring them into focus. Then I'll ask your opinion.                                                  
                                                                                                                                        
  My idea (glimpse)                                                                                                                     
                                                                                                                                        
  Github Repo: Repo_Original                                                                                                            
                                                                                                                                        
  Knowing, for MVP, this is a single user local experience, Github will have a local and remote, Gitea will only be local.              
                                                                                                                                        
  As a developer I have updated 3 files and added 7.                                                                                    
                                                                                                                                        
  As a developer I Switch and am now "Poof" in the "DABBLE" environment,                                                                
                                                                                                                                        
   * Scneario A: New Gitea Repo, which since it's first we can mirror the name of                                                       
                                                                             
