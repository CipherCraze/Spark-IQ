const port =4000;
const app = require('./app');
const server = app.listen(port, () => {
    console.log(`Server is running in the port 4000`);
})