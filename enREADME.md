# Goods Issue


## Brief Description
   The website is designed for internal goods issuance and is used to record the goods purchased by employees. The database stores information about the employee, product, date of receipt/payment, invoice number in the current year, invoice number in the current month, and prices of products along with the total invoice amounts.


## Functionalities
   On the website, you can add, edit, or delete an invoice. Users can also modify data related to purchased/issued products, date, month, and week of receipt.

## Technologies
   * HTML
   * CSS
   * Bootstrap
   * JavaScript
   * Node.js
   * Express
   * Nodemailer
   * Dotenv
   * Flash
   * Method-override
   * Passport
   * Mongoose


## Usage

 1. Home Page

    The home page is designed for adding invoices. Users create a new invoice by clicking the "Add Product" button, adding a line where they enter the product name, quantity, price, "VAT" (internal VAT), checking whether the product is free, and then clicking the "Finish" button to activate JS to calculate the price for that product.

    Users can add an unlimited number of products in this way.

    When users finish adding products, clicking the "Pay" button activates JS to calculate the total invoice amount.

    Clicking the "Print" button saves the data to the database and optionally prints the invoice on A4 format.

2. "All Bills" Page

    Clicking on "All Bills" redirects you to the "All Bills" page where all invoices will be displayed. In the navbar, there are additional buttons to show paid or unpaid invoices.

    Each row/invoice is a hyperlink to view the details of the selected invoice. Clicking on one of the invoices redirects you to a page displaying the details of the selected invoice, along with buttons for Edit, Delete, or Print the invoice.

    Clicking the DELETE button deletes the invoice, provides a notification, and redirects to the page with all invoices. Clicking Print provides an option to print the invoice.

    Clicking EDIT redirects to the edit page where you can modify product data or issuance and payment details.

3. Search Employee

   On the search page, you can enter the employee's name, and as a result, you will get a list of products purchased by that employee. Adding the product name in the input field will display another table on the left          showing the product name and the number of times the employee purchased it.

   After clicking submit, you can choose to display all (default) or unpaid invoices and an option to print the search results.

4. Vacations

   The page is divided into 3 columns.

   - 1st Column:
      The vacation page displays data on the vacations of all employees. The top table on the left (on a computer) shows data on vacations, such as the employee's name, last year's and this year's vacation, and the number of used and remaining vacation days.

      Below, for each employee, there is a table showing approved vacations with the start and end of the vacation and the number of days.

   - 2nd Column:
      In the second column, there are 3 tables. The first table is for submitted vacations that are not yet approved or rejected. The table includes a button to approve or reject the vacation.

      The second table contains information about approved vacations but only if the last day of the vacation is after today. The table includes a button to reject the vacation.

      The third table contains rejected vacation requests but only if the first day of the vacation is before today. The table includes a button to approve the vacation.

      Clicking the button to approve/reject the vacation also updates the employee's vacation count.

   - 3rd Column:
        In the third column, there is a form for editing vacations and overtime for employees, which appears when you click the "Submit" button. In the first input or select field, select the employee's name, enter the number of last year's vacation in the second, this year's vacation in the third, and finally, enter the number of employee overtime hours in the fourth field.

5. Users

   The users' page is divided into 2 columns.

   - 1st Column:
      The first column contains a table with user data who can log in to the website. The table includes data such as username, role, Edit, and Delete.

      Clicking Delete deletes the user from the database (People). The Edit button redirects to the user's edit page where there are 2 options: change the username or role.

    - 2nd Column:
        The second column includes a table with data for all employees, including current and former employees. The table displays data such as name, surname, employment status, and current status (active, inactive) and an edit button.

        Active employees are highlighted in green on one side, and inactive ones are highlighted with a red background on the other side.

        Clicking Edit redirects to the employee/edit page where you can change the employee's data, such as name, surname, employment status, and current employment status in the company.

6. Add Employee

    The add employee page is a page that includes a form for adding a new employee. The required data to enter are name, surname, password, employment status, and current status.

7. Add User

   On the add user page, there is a form with a username, password, and role.

## Database
  For the database, I used Mongoose. I use a total of 7 databases:
  
   1. Costs - This database stores invoices for the internal sale of goods.

      - Data stored in the database include:
        - Invoice date,
        - Purchased products,
        - Total invoice amount;
   2. Employees - Storage of employee data.

      - Data stored include:
        - username,
        - lastname,
        - password,
        - status,
        - employment type;
   
   3. People - This database stores data for individuals who can log in to the "Goods Issue" website and possibly view or modify data.

       - Data stored include:
         - username,
         - role,
         - password;
   
   4. Users - This database stores all data when adding a new invoice.

       - Data stored include:
         - Issuer,
         - Buyer,
         - Sales date,
         - Calendar week,
         - Year,
         - Month,
         - Invoice number in the current year,
         - Invoice number in the current month,
         - Payment date,
         - Paid (boolean),
         - Products - nested array object:
           - Product name,
           - Quantity,
           - Price,
           - One product per week (boolean),
           - Total price;
   
   
   5. Vacations - This database stores data for employees, including the number of hours, vacation from the previous and current year, and submitted vacation applications.

       - Data stored include:
         - Employee,
         - Last year's vacation,
         - This year's vacation,
         - Used vacation,
         - Overtime,
         - Submitted vacation applications (NESTED OBJECTS):
           - Vacation start date,
           - Vacation end date,
           - Number of days,
           - Status (default "pending"),
           - Date of application submission;

   6. Notifications - This database stores notification data. Notifications are displayed on the website when a user submits a vacation application.

      - Data stored include:
        - Employee's name and surname,
        - Employee id,
        - Vacation object id,
        - Number of days,
        - Status (default "false," changes when the boss approves or disapproves the vacation).
   
   
   7. Session
      Session data is used when a user logs in to the website.

## Author
   ### Ermin Joldić

## Contact
   - Ermin Joldić,
   - +38640415987
   - erminjoldic26@gmail.com

## Additional Tips
   For any data modification on the website, only users whose role == Admin or Moderator have access.

  The Visitor role has access to view the page and can test post forms. As a result, they will receive a flash message with information that editing is allowed only for Admin or Moderator.
  
  To test the website, you can log in with:
  - Username: test1
  - Password: test1
  - https://izdaja-blaga.onrender.com/
