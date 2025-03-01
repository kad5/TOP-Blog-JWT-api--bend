The painful path of bugs and fixes

the live preview
https://timely-sfogliatella-b74439.netlify.app/

the front end repo
https://github.com/kad5/blog-fend
(warning , the code is spagetti and it sucks)


This is my submission for the blog api odin project. it turned much harder than i thought. initially the backend 
took 2 days 4 hours each, very fast and organized. tested well with thunder client.

Then the front end took a full week just for html and css, and looked kinda okey.
the comes the vanilla js on the front end (i skipped the react course for now) and turned out to 
be the most buggy console logged pile of trash i have ever coded . 

For some reason i decided to code it as a single page application with vanilla js only - just like i 
did with the todo app assignment which was a banger that got many <3 s on Odin. Turns out 
when there is data fetching involved, vanilla js spa becomes much more complex. 

You obviously are going to use the req.params in your backend routing, so you need to have that 
showing up in the browser. I googled and i found out that this is achieved by a routing function/class module. 

Great, i added a routing function,. Time for testing !! after all the backend was already tested via 
thunder client, so the front end testing should just involve DOM manipulation, right? WRONG 🥲🥲🥲

Enter C O R S. it actually entered in my backend and im not talking about code 🍑. Oh boy cors 
really fucked me up. Eventually I managed to get local environment to work with cors by manually 
validating the https token that is received by my browser (by hitting secure twice and marking it as 
secure on the cookies under application on dev tools, this is only available on chrome).

So after CORS, it should all work, right? not entirely. I still needed to add some code to track 
state (having the username show up on the header if logged, and a sign in/ sign up if logged out). And 
boy that was another roller coster 🎢🎢. Another reason why react is a boss and all those crybabies on 
youtube and stack overflow that complain about it should just stfu. zip it...

You achieve state in vanilla via a class that saves to local storage. it saves isAuthenticated boolean, and 
some basic user data like id and username, also role. fine coded, lets test. the code looks solid. right?

Enter REDIRECTS🥲🥲

Since this is an SPA, if you enter a route in the browser address bar, it will understand it as a request for 
another page. But your entire app is on just one single page and you are using the history API to manually
 insert the routes into the address bar. So what gives? well there is a solution which is redirects. you
 basically tell your app that annnnnnny request should route to the index.html and from there your 
front end router class/ function would handle the routing. 

Primo. Time to test redirects. well you can't on local host because of the manual securing of the https cookie. 
So this will be tested after deployment. That's not a big deal, if the tests fail, how bad could it be? just few
 lines of code. right? wrong again.

Time to deploy. Backend to railway > quick and easy as usual. frontend, hmmm lets host on github pages. 
but before that, lets webpack our frontend because i have not been using webpack that often and i want to 
refresh my cli and setup.

enter webpack and github. now I remember why i was skipping on that 💩💩💩. eventually it worked. 
Ok lets test redirects

CORS issue > webpack and fix, env variables webpack again and fix. finally now time to test the redirects. 
turns out github pages doesn't allow redirects 💩💩💩. every thing is a github 404. what a mess. Im going to 
sleep and lets fix it tomorrow

Tomorrow comes, tried some workarounds in github pages, didnt work. time to give up on github pages and 
just netlify this shit. 

OH MAH GAWD, netlify a gift from heaven. redirects work and no need to fix anything. lets wait and see what 
others will write on my blog. 

2 days later, no one wrote nothing. hmmm let me test this and see what's going on. Tries to create a new 
account > fail
tries to log in > succeeds. sign up fail. What is the issue now omg 😭😭😭🥹

lets check railway logs. hmm something about the bcryptjs.hash is not working. strange. that piece of code 
is exactly what i used for the members only project and it worked there. in fact the members only was still 
hosted on my railway and it still works. but bcryptjs on this project gives me an error about the salt being a string !!

Ok, maybe my code is bad. check backend , check frontend. 10s of console logs everywhere. it all checks! im 
passing the password as a string and the salt correctly into the hash function. ok lets try the other hash function 
the hashSync, welp


another error. something about a web bla bla bla api missing. Ok. test locally via thunder client > backend 
works. test the same exact code on railway via the same exact thunder client request > error.

eventually i deduced its a railway issue. verify nodes on railway > latest. verify bcryptjs on railway > latest. 
even the same railway account runs bcrypt on the members only and it works. WTF railway.

Ok nevermind, delete the container and reupload, still not working. Ok get the railway cli and force delete 
bcryptjs package then re install it. doesnt work. ok replace it with an older bcryptjs. still wont work. eventually 
after countless re deploments i decided to opt for arogon2. And it works 🤩🤩🤩🤩🤩🤩🤩🤩🤩 finally.
 but now since encryption is different, all the stored passwords for the present accounts wont work. 
That sucks but hey, now i can create another account and finally sign up

great i can sign up and sign in. but waaaaaaaait a minute. the state on the frontend is not being updated 
correctly after sign up. it is correctly updated after login but not sign up. some short debuggin later and 
turns out my json response from the sign up is outdated (because i wasnt able to test new sign ins via 
front end locally - only thunder , but now i can so bugs reveal themselves). Just one last github push and
 railway redeploy and it all magically works 🙏🙏🙏


still few DOM bugs here and there. but those are easily fixed with a bit of coding that im too lazy to do. 
The main thing is that it all works now. So if you have reached this far, lets look at what actally "all" is:

Auth: awesone setup via jwt https tokens that enforces a single device policy (meaning if you logged in 
from 1 device, then logged in from another, the 1st device gets logged out automatically). this is achieved 
via checking token iat vs a stored last login date. if the token iat is before the last login date, that means a 
new token was issued so this one should be invalidated. 

ofcourse if you are using refresh and access tokens, you would just store the refresh token and check against
 that instead of my approach.

what else?
 auth levels. 
1. everyone can view posts, but only logged in users can view other user's profiles and comment
2. only users who are authors can write articles, but technically anyone can request to be an author
3. articles can be drafts (only you can see them) or public to view to the relevant audiance
4. public articles can be viewed by anyone, while premuim articles can only be viewed by logged in paying users
5. if you opt to pay , you get the premuim (no actual paying happens, just a button you click to change your account permissions).

other features include:

 an awesome schema that has users, posts, comments, and favorites. 

backend that checks and double checks to make sure the correct person is editing or deleting the correct thing

cool ui in vanilla js and css. not too bad, could be better.

final takaways

-vanilla frontend single page application, good learning journey but not really needed since react makes it much easier
-webpack sucks. github pages suck
-apis are soooooooooo nice to code. only returning json and status codes it the way to go
-cors is painful but rather than testing via frontend on local host. just deploy the backend and test it via 
local thunder client calls, then test the frontend against local host without cors. finally test deployed front 
and backends against each other
-deployment bugs can be very unexpected. just change host or change code (even though it should be working) 
and move on.
-finally dont skip on testing 

a truly educational journey. If you reached so far, comment , like , share and subscribe. <3 <3

 


