

# Preamble
## Initial review

We need to work on hardening our Details for the new Ticket;

> Currently when we close a chat the user can no longer review the chat session history. We need to evaluate and determine what we know and don’t know… 

This ticket will include work to define and implement mocks to act as place holders…..

TODO:  Get ~/projects/WEB-xxxx startd.

J



### Task Assigned

Cody Loyd  [8:40 AM]
yooo i got a little project for you
[8:45 AM]from what I can tell it should be easy... BUT there aren't very clear requirements stated anywhere and the designs are a little 'sketchy' at the moment.

So the hardest part is going to be digging in and getting a clear idea of what needs to be done.  The actual doing should be pretty trivial 

project channel: #glacier-working-group

this slide-deck is all we have for designs at the moment: https://www.figma.com/deck/sIetcCDoFyNvhgzqDW8T8Z/Glacier-Alignment---Delivery-Plan?node-id=107-387&t=4TijKvMtZsU60qs5-1

the biggest thing that i know we need to do is on slide 17 (attaching a screenshot for reference) but it is not clear to me how we are supposed to know a chat has ended.  You'll need to go figure that out.

Probably also helpful to poke around in the project channel and make sure nothing else is slipping through the cracks.  MOST of the work is in the Admin client.. we were kind of forgotten 
CleanShot 2026-01-29 at 10.43.57.png [8:46 AM]I do know that they've decided not to do this slide yet.. (it'll be milestone 2)

i.e. they want to be able to mark FI agents as available or away or whatever... we aren't doing that right now.
CleanShot 2026-01-29 at 10.46.05.png [8:47 AM]SO: find some time to dig around a little bit and get your bearings and then if you have questions I'll see what I can do.xxxxx<D-x>xxxxxx<D-x><D-x><D-x><D-x><D-x><D-x>
Lenny Miller  [8:54 AM]
Ok, I'll start this after finishing what Zeb gave me, which is small, and then I'll pick this up


### Reviewed Slack Channel

Cody Loyd  [8:49 AM]
Do we know how the Chat Termination is supposed to work yet?  Is there an API contract change or something we can see that would indicate a conversation has been closed?
11 repliesRiver Ginther  [8:51 AM]
Based on all the talks I have had, the Enterprise side is simply just handling all Closed conversations in that way now.

So instead of using the Closed websocket message to display a little sentence, we just hide the chat compose area entirely and display the new message (with a reopen button for the Enterprise side).
Cody Loyd  [8:52 AM]
'in that way' ?

in what way?
[8:52 AM]like where is the 'isClosed' data coming from lol
River Ginther  [8:52 AM]
Displaying the new closed message
Cody Loyd  [8:53 AM]
we're talking past each other.. i don't care at the moment about client-side implementation.  I need to know how I know a convo is 'closed' 
River Ginther  [8:53 AM]
We have some logic that pulls the current active status of the conversation to display a closed message (this logic was already in place for us).
[8:54 AM]A conversation will be closed if its most recent status change is Closed - based on the details of the conversation history.
[8:54 AM]CaseDetails event specifically
Cody Loyd  [8:55 AM]
right on.  Thanks 

I'm putting @Lenny L. Miller on this project... maybe most of the work is already done on our side too 

I assumed we'd be getting some new data to facilitate this 'closed' thing.
[8:55 AM]Lenny will likely have more questions once he gets into the code to see what we have going on there
River Ginther  [8:58 AM]
Yeah, I thought so to based on the preliminary talks we were having. It sounded like we needed a new permanently closed status so we could handle this a separate thing.
gg
But it's one in the same. I imagine BO is already showing if the status is closed on your side (though I don't know for sure), so you probably already have some logic that exists for this.
### Domain Expert Review
#### Environment, 
`yarn serve j`
#### Steps, 
#### Code Mapping



