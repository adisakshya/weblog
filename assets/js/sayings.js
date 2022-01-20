fetch('https://gist.githubusercontent.com/adisakshya/71b0e18f59a58c145e32a2be9a30069d/raw/f3daeb3a428521dee666fffebbd8ab519ff597e8/sayings.json')
    .then(async function (response) {
        const sayings = await response.json();

        // Create array of lot names
        const lots = Object.keys(sayings);
        console.log(sayings)

        /**
         * Generate random index based on number of lots
         * Select a lot name from the array of lots using the random index
         * */
        const randLot = lots[Math.floor(Math.random() * lots.length)];

        // Use the lot name to get the corresponding sayings from the "sayings" object
        const lot = sayings[randLot];

        // Select a random saying from the randomly selected lot
        const sayingObject = lot[Math.floor(Math.random() * lot.length)];
        const saying = sayingObject['body'];
        const author = sayingObject['author'];

        // Display the saying
        document.getElementById('sayingblock').innerHTML = saying;
        document.getElementById('citation').innerHTML = author;

    })
    .catch(function (err) {
        console.log("Oops! Encountered an error : ", err);
    });