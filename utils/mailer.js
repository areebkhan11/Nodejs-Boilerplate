const nodemailer = require("nodemailer");
const { EMAIL_TEMPLATES } = require("./constants");

function replaceAll(str, find, replace) {
    return str.replace(new RegExp(find, 'g'), replace);
};

exports.mail = async (...args) => {
    const [templateType, resetUrl, to, email, firstname] = args; // Extract firstname from args

    let html = "";
    let subject = "";

    if (templateType === EMAIL_TEMPLATES.RESET_PASSWORD) {
        subject = "Reset Password";
        html = this.generateHTMLString(templateType, { reset_url: resetUrl, email: email, firstname: firstname }); // Pass firstname to generateHTMLString
    }

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        html,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent: " + info.response);
    } catch (error) {
        console.log(error);
    }
};

exports.generateHTMLString = (type, data) => {
    let result = "";
    try {
        let templateContent = "";
        switch (type) {
            case EMAIL_TEMPLATES.RESET_PASSWORD:
                templateContent = `
                    <!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Password Reset Request</title>
                        <style>
                        body {
                            font-family: Arial, sans-serif;
                            background-color: #f4f4f4;
                            padding: 20px;
                        }
                        .container {
                            max-width: 600px;
                            margin: 0 auto;
                            background-color: #fff;
                            padding: 20px;
                            border-radius: 10px;
                            box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
                        }
                        h2 {
                            color: #333;
                        }
                        ul {
                            list-style: none;
                            padding: 0;
                        }
                        a.button {
                            display: inline-block;
                            background-color: #007bff;
                            color: #fff;
                            text-decoration: none;
                            padding: 10px 20px;
                            border-radius: 5px;
                        }
                        a.button:hover {
                            background-color: #0056b3;
                        }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <h2>Password Reset Request</h2>
                            <p>Hello <strong>${data.firstname}</strong>,</p>
                            <p>We have received a request for a password reset. If you wish to continue, please click on the link below to reset the password.</p>
                            <ul>
                                <li><strong>Email:</strong> ${data.email}</li>
                            </ul>
                            <p><a href="${data.reset_url}" class="button">Click here to reset</a></p>
                            <p>Thank You,<br>Team InnoAppAnalytics</p>
                        </div>
                    </body>
                    </html>
                `;
                break;
            // Add other cases if needed

            default:
                break;
        }
        result = this._bindEmailData(type, data, templateContent);
    } catch (error) {
        console.log(error);
    }
    return result;
};

exports._bindEmailData = (type, data, htmlString) => {
    let resultHTML = htmlString;
    let firstname = data.firstname;
    console.log(firstname,"firstname");
    let email = data.email;
    console.log(email,"email");

    // Conditional Email Variables
    switch (type) {
        case EMAIL_TEMPLATES.RESET_PASSWORD:
            resultHTML = replaceAll(resultHTML, '{{reset_url}}', data.reset_url);
            break;

        default:
            break;
    }

    return resultHTML;
};
