const jwt = require('jsonwebtoken');
const pg = require('pg');
const axios = require('axios');
const cheerio = require("cheerio");


const dbConfig = {
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_DATABASE,
};

let pool = new pg.Pool(dbConfig)

const allowedExportTypes = ['JSON', 'CSV', 'GoogleSheet'];

const urlToBeScrapped = "https://interaction24.ixda.org/";

async function dataScrapper(){
    try{
        const { data } = await axios.get(urlToBeScrapped);
        const $loadedData = cheerio.load(data);
        const listItems = $loadedData('.speakers-list_item');
        const output = [];
        listItems.each((id, element) => {
            const elementObj = {
                name: '',
                role: '',
                imgUrl: '',
                socialMedia: [],
            }

            //console.log($loadedData(element).find('a').attr('href'));

            /*const personName = $loadedData(element).find('.lister-item-content')
                .find('.speakers-list_item-wrapper').find('.margin-bottom')
                .find('.margin-bottom').find('.speakers-list_item-heading').text();*/

            const personName = $loadedData(element).find('.speakers-list_item-heading').text();
            const personImgWithoutBaseURl = $loadedData(element).find('.speakers-list_item-image-wrapper').find('img').attr('src');

            //Searching for all social media links for a person and filters out placeholders like 'index.html#'
            const personSocialMedia = $loadedData(element).find('a')
                .map((id, el) => $loadedData(el).attr('href')).toArray()
                .filter((link)=> link.startsWith('https'));

            //The role is a plain text without any class, so filtering is needed here
            const personRole = $loadedData(element).find('div').contents().filter(function () {
                return this.type === "text";
            }).text();

            //There are some anomaly objects that do not have img url/name and that leads to errors, so this iteration skip solves problem of them
            //Also, they do not appear on the web UI, so I do not miss anything
            if (!personName || typeof personImgWithoutBaseURl !== 'string') return;


            //Each profile picture start with '../', so removing first 3 elements of the string.
            //Also, some profile pictures have space ' ' in their url, which is not being encoded and ruins the url. Simply replacing it with its url-encoded value
            const personImgWithBaseURl= urlToBeScrapped + personImgWithoutBaseURl.substring(3,personImgWithoutBaseURl.length).replaceAll(' ', '%20');


            elementObj.name = personName;
            elementObj.imgUrl = personImgWithBaseURl;
            elementObj.role = personRole;
            elementObj.socialMedia = personSocialMedia.slice();
            output.push(elementObj);
        });

    } catch (error){
        console.log(error);
    }
}


const parsePage = (request, response) => {
    let { exportType } = request.query;
    const { authorization } = request.headers;

    if (!authorization) return response.status(401).json({message: 'User unauthorized.'});

    //Checking if JWT is valid
    try{
        const decodedData = jwt.verify(authorization, process.env.JWT_SECRET);
    } catch(error) {
        return response.status(401).json({message: 'User unauthorized.'});
    }

    //Checking if JWT is blacklisted. If no - proceed with parsing
    pool.query('SELECT * FROM expired_tokens WHERE token = $1', [authorization], (error, results) => {
        if (error) {
            console.log(error);
            return response.status(500).json({message: error.detail});
        }

        if (Array.isArray(results.rows) && results.rows.length !== 0) {
            return response.status(401).json({message: 'User unauthorized.'});
        } else {
            //TODO PARSING HERE.
            console.log('STARTED');
            dataScrapper();
            return response.status(200).json({message: 'parsing...'});
        }
    });
};

module.exports = {
    parsePage,
};