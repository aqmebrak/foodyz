# Foodyz — FlanFan sideproject


Context: I am a fan of flan, the french vanilla pastry. 
Around my town there are dozens of pastry shops that sell flan, and I want to try them all.

I want to make a little public view of all the flan I already tried, place them on a map, show the photos I took of each one of them, 
and give them a rating.

This wil be stricly for my personal use.

## Phase 1 - Simple view
- [] **1.1** Create a simple page "/flan" that shows a map of LYon,France. 
- [] **1.2** On the backoffice, add a new menu entry where we will administrate the flans we tried.
- [] **1.3** In the backoffice, create a new entity "Flan" with the following fields:
  - Name (string)
  - Location (string)
  - google maps url (string)
  - Photo (file on Vercel Blob)
  - Rating (number)
  - Tried or not (boolean)
  - The date we tried it if tried (date)
- [] **1.4** In the backoffice, create a CRUD interface to manage the "Flan" entity.
- [] **1.5** On the "/flan" page, display all the flans we tried as markers on the map, using the google maps url to get the coordinates.
- [] **1.6** When we click on a marker, show a popup with the photo, name and rating of the flan.

## Phase 2 - Advanced view
- [] **2.1** On the "/flan" page, add a filter to only show flans with a rating above a certain threshold.
- [] **2.2** On the "/flan" page, add a search bar to search for flans by name or location
- [] **2.3** On the backoffice, add a filter to only show flans that have been tried.
