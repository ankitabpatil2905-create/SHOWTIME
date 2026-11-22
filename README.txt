SHOWTIME – CINEMA TICKET BOOKING SYSTEM
Integrated Java console project

REQUIREMENTS
- Java 17 or later (tested with OpenJDK 21; compiled using --release 17)
- VS Code with Extension Pack for Java, or a terminal with JDK installed

PROJECT STRUCTURE
ShowTime_Project/
  src/showtime/                 Application and domain classes
  src/showtime/exceptions/      Custom checked exceptions
  README.txt
  AI_LOG.txt
  TEST_RESULTS.txt
  run.bat / run.sh

OPEN IN VS CODE
1. Extract ShowTime_Project.zip.
2. In VS Code choose File > Open Folder.
3. Select the extracted ShowTime_Project folder.
4. Install/enable 'Extension Pack for Java' if prompted.
5. Open src/showtime/Main.java and run it, or use the terminal commands below.

COMPILE AND RUN (from the ShowTime_Project folder)
Windows:
  run.bat
Linux/macOS:
  chmod +x run.sh
  ./run.sh

Manual commands:
  javac --release 17 -d out $(find src -name "*.java")
  java -cp out showtime.Main

RUN AUTOMATED INTEGRATION CHECKS
  javac --release 17 -d out $(find src -name "*.java")
  java -cp out showtime.IntegrationTests

MENU
1. View Seat Chart
2. New Booking
3. View Bill
4. Daily Report
5. Exit

BOOKING INPUT
- Enter seat class ID followed by quantity.
- Enter -1 at the seat ID prompt to undo the most recent selection.
- Enter 0 at the seat ID prompt to finish and commit the selection.
- Seat IDs: 101 Front Stall, 102 Middle Stall, 103 Balcony,
  104 Gold Recliner, 105 Couple Sofa, 106 Wheelchair Bay.
- Age 60 or above receives the 20% senior discount; GST is 18%.

NOTES / LIMITATIONS
- Bill and report records are held in fixed-size arrays in memory during a run.
  They reset when the application exits. BookingLogger appends a text log to
  booking_log.txt in the current working directory.
- A multi-seat-class order creates one bill record per selected seat class.
- The daily report covers bills created in the current application session.
- This is a console Java implementation, not yet a website/backend.
