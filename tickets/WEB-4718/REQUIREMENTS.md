This is my first attempt to convert this to a template.. 

This report with all the sections, how you have basically all the following process

1. Developer: Instruct AI to create document(s) about <FEATURE_DOMAIN>.
2. AI Generates Document(s) Using PlantUML with a specific series of UML based sections
3. Developer: Reads and understands the <FEATURE_DOMAIN> to then create a new <NEW_ENHANCEMENT>.  Then instructs the AI to create the test and document back changes to satisfy the requirements
4. AI Generates Code to meet the specifications for the <NEW_ENHANCEMENT>


Using the `/Users/LenMiller/code/banno/platform-ux/projects/banno-online/WEB-4718/cursor_magic_links_explanation_and_usag.md` as the conversation I essentially want to automate and generalize

This falls uder a new enhancement (NEW_ENHANCEMENT), and basically follows a multipass refinement 

1. AI Creates Learning Documents (<WORK_DOCUMENT> based on `/Userst /LenMiller/code/banno/platform-ux/projects/banno-online/WEB-4718/magic-link-sequence-diagrams.md` 

In Context to Magic Links
<FEATURE_DOMAIN>: Magic Links
<NEW_ENHANCMENT>: 
<WORK_DOCUMENT>: `/Users/LenMiller/code/banno/platform-ux/projects/banno-online/WEB-4718/cursor_magic_links_explanation_and_usag.md`

<NEW_ENHANCMENT>

Review <FEATURE_REQUIREMENT>


Actor: generates an initial prompt, for instance, since i know I am going to be doing an enhancement to an existing feature, In this case the Domain is Conversations

<FEATURE_DOMAIN> - Conversations
<WORK_DOCUMENT> - 

Learn <FEATURE_DOMAIN> --> AI Generates Working draft of <WORK_DOCUMENT>.

Write <NEW_ENHANCEMENT> -->  Design Doc

Write <NEW_ENHANCMENT> --> Plan

Write <NEW_ENHANCMENT> diff UML Diagrams (before/after) --> 

