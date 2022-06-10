const API_KEY = '456_2kfoPbi7Aw_kPQ3LOt2nZ3Y';
const API_URL = 'https://ci-jshint.herokuapp.com/api';
const resultsModal = new bootstrap.Modal(document.getElementById('resultsModal')) //uses Bootstrap 5's Modal function to to trigger the results Modal using JS

document.getElementById('status').addEventListener('click', e => getStatus(e))

async function getStatus(e) {
    const queryString = `${API_URL}?api_key=${API_KEY}`

    const response = await fetch(queryString)

    const data = await response.json()

    if (response.ok === true) {
        //console.log(data.expiry)
        displayStatus(data)
    }
    else {
        throw new Error(data.error)
    }
}
//async function is an asynchronous function
//It is a way of handling promises 
//It is an alternative to chaining .then() methods together
//The await is the equivalent of .then() - the thing that will happen when the promise is fulfilled
//const data converts the response into a JS Object using the .json() method 
//response has a key of 'ok', which is a boolean true / false value
//if the HTTP status code is 200, which is a successful request, then the ok key has a value of true
//if the HTTP status code is not 200, which is anything other than a successful request, then the ok key has a value of false
//The if statement checks if the value of the ok key is true, i.e. if the HTTP status code is 200. The === true is unnecessary, but I like to include it
//In this case, data will be a JS Object with two keys - an expiry date and a status code. The console.log is accessing the data object so that just the expiry date is logged
//The else statement triggers if the value of ok is false, i.e. if the HTTP status code is not 200
//In this case, data will be an object (from the .json method), but will have different keys - error, error_no and status_code
//Here, we are logging the value of the error key, which is the error message of the unsuccessful request
//The else can be tested by deliberately messing with the request, such as by changing the value of the API_KEY
//This will return a 403 error, meaning Forbidden, since our API key is invalid
//Rather than logging the data response to the console, we want it to appear in our Modal
//This will be achieved with the displayStatus function below:

function displayStatus(data) {
    
    document.getElementById('resultsModalTitle').innerText = 'API Key Status'
    let expiryDate = data.expiry
    document.getElementById('results-content').innerText = `Your key is valid until \n ${expiryDate}`

    resultsModal.show() //shows the modal 
}

function processOptions(form) { //creates a comma-separated list of the selected options, since without this, a new key-value is created for each option that is selected
    //The function creates a temporary array that holds each option, then converts this to a string
    let optionArray = [] //empty array

    for (let entry of form.entries()) {
        if (entry[0] === 'options') {// form.entries() creates a number of arrays, each with two elements. The first element is the form input, and the second is the value of that input 
        //This will filter out those entries of form.entries that are not options
        //so, each entry is an array, and hence [0] of that array should be the name of the input
            optionArray.push(entry[1]) //pushes the second element of the entry array to the temporary array
        }
    }
    form.delete('options') //deletes all occurences of options in the form array

    form.append('options', optionArray.join()) //appends the values of the optionArray to the form array as a string

    return form //returns form to the const form below
}


document.getElementById('submit').addEventListener('click', e => postForm(e))

async function postForm(e) {
    const form = processOptions(new FormData(document.getElementById('checksform'))) //FormData is a JS tool that captures all of the data in a form and returns it as an Object
    //This object can then be simply passed to the fetch method with no further work needed
    //FormData is passed to the processOptions function
    
    /*
    for (let entry of form.entries()) { //uses the entries method, which is a built in method of FormData
        console.log(entry) //Uses a for loop to log out the values of the Object produced by FormData, which should be the entries made by the user
    }
    //exists for testing purposes, logs out the values of form to the console
    */

    const response = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Authorization": API_KEY,
        },
        body: form, //this key - value pair is what allows the page to send data to the API. form is same as the variable defined above that holds the form data
    })

    const data = await response.json() //the equivalent of a second .then() method
    //converts the data received from the API (via the API?) into a JS Object

    //as with the getStatus function, we need to do something with teh 
    if (response.ok === true) {
        //console.log(data) //logs data to console
        displayErrors(data) //calls the displayErrors function
    }
    else {
        displayException(data) //calls the displayException function, which triggers the modal with the error information
        //the function call must be before the throw statement, as a throw statement ends any JS execution, much like a return statement
        throw new Error(data.error) //logs error message to the console
    }
}

function displayErrors(data) {

    document.getElementById('resultsModalTitle').innerText = `JSHint Results for ${data.file}` //sets heading of Modal to the file name that is supplied by the user
    let results = '' //declares results as an empty string

    if (data.total_errors === 0) {
        results += `<div>No errors found!</div>` //adds this HTML to the results variable
    }
    else {
        results += `<div>Total errors: ${data.total_errors}</div>` //displays total number of errors
        
        for (let error of data.error_list) { //loops over the error_list to display information about the errors
            results += `<div>At line ${error.line}, column ${error.col}</div>` //indicates which row and column the error was identified at
            results += `<div>${error.error}</div>` //displays error message
            //Adds both to the results variable
        }
    }

    document.getElementById('results-content').innerHTML = results //displays value of results variable

    resultsModal.show() //displays modal
}



function displayException(data) { //if an error occurs, the particulars are logged to the console but should also be alerted to the user via the modal
    //data is an object that contains the error information - error, error_no and status_code
    document.getElementById('resultsModalTitle').innerText = 'An Exception Occurred' //sets modal heading
    let results = '' //empty results variable

    results += `<div>The API returned status code ${data.status_code}</div>` //adds error status code
    results += `<div>Error number: <strong>${data.error_no}</strong></div>` // adds error_no
    results += `<div>Error text: <strong>${data.error}</strong></div>` //adds error message

    document.getElementById('results-content').innerHTML = results //inserts contents of results variable
    resultsModal.show() //displays modal
}
//Future me - if you ever doubt yourself, remember that you are a badass, and that you figured out the code for the displayException function yourself!