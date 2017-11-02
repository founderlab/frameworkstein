# Deploying web apps to Elastic Beanstalk on AWS

### Intro
FounderLab web apps are hosted on Amazon Web Services. We use the following services:

 - Elastic Beanstalk: Takes care of deploying our node apps to EC2 instances. Can be used to scale out to multiple instances, but we haven't needed to look at that so far. 
 - RDS: An SQL Database, runs Postgres
 - S3: Static file hosting

### AWS Account
Make sure you have registered an account with AWS before starting. You'll need to sign in the the AWS console and find your aws-access-id (this is your users AWS id) and aws-secret-key (secret key that functions like a password).
If you don't have these you can generate them from the AWS console here: https://console.aws.amazon.com/iam/home?#security_credential
Instructions on doing so can be found here: http://docs.aws.amazon.com/general/latest/gr/getting-aws-sec-creds.html

### S3 Bucket creation


### Elastic Beanstalk CLI
If you don't have this installed already, do so now. 
- Install the Elastic Beanstalk CLI: http://docs.aws.amazon.com/elasticbeanstalk/latest/dg/eb-cli3-install.html

If you have used the CLI before with a different user, you'll need to delete or rename the config file at `~/.aws/config`

Don't run `eb init` just yet - we'll make the application in the web console first.


### Elastic Beanstalk application+environment creation
Head to the Elastic Beanstalk console at https://ap-southeast-2.console.aws.amazon.com/elasticbeanstalk
From here we can create a new application in which we'll host our environment (where we'll run our app).
- Hit the 'Create New Application' button in the top right
- Give it a name and description and hit next
- Hit 'Create Web Server' to start creating an environment
- Platform -> Node.js
- Environment Type -> Load balancing, auto scaling (there doesn't seem to be a downside to selecitng this over single instance. We're not covering scaling in this doc though)
- Source -> Sample application
- Environment name -> <appname>-<environment> (e.g. founderlab-staging)
- Same for url
- Check the 'Create an RDS DB Instance with this environment'. This is important, as it'll simplify hooking up the database to the app if we create it as part of this process.
- The next page can be left on defaults (feel free to check the options and adjust as desired)
- Environment Tags -> Just add one for now - {Key: NODE_ENV, Value: staging} (or whatever environment this is)
- RDS configuration
    - DB Engine -> Postgres
    - Username -> root

- Phew! Continue, review your settings and launch the instance.


### RDS Postgres database configuration


### Elastic Beanstalk deployment