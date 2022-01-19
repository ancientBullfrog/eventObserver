# eventObserver
The purpose of this class is to watch for clicks on anchor tags inside a specified container, load the linked resource and update the display. This is the default behaviour; however, it's possible to customise the event watched for and how the class responds; probably not all that usefull - I got carried away!

The inspiration for this was to create a menu system like Github - an admin portal could be loaded and updated without refreshing the page every time. I noticed Github used Pjax. Pjax appears to be far more complex then this version; although this version meets my needs (ignoring the unecessary extras 😲). 

When a loaded resource includes a script; it is extracted and dymnamically loaded via 'import(...)'; attempts to copy it into the <head> worked but required extra managment to remove / check for in when the user moves away from and back to a given page.

There is a degree of sanitisation for loaded resources, but since its designed for my own purpose its unlikely I'll add malicious code; however, it's a fun exercie!
  
Lastly, it has some error checking to make sure everything required is provided, if its not; it'll refuse to play, sorry.
  
  As mantioned the default behaviour is to watch for clicks on links; other fun things it could do are:
  - tell you when to click on a paragraph, header, button... vital feedback!
  - watch for a transition to finish and respond with whatever you like ...just like using an eventListener for 'transitionend' would do
  
  I guess this class allows you to watch the page for various events from one convenient location.
  
  It has not been thouroughly tested for anything beyond its default behaviour.
