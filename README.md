[![Hits](https://hits.seeyoufarm.com/api/count/incr/badge.svg?url=https%3A%2F%2Fgithub.com%2FLucBerge%2Fstiv&count_bg=%2379C83D&title_bg=%23555555&icon=&icon_color=%23E7E7E7&title=hits&edge_flat=false)](https://hits.seeyoufarm.com)
# STIV (Free) 

Stiv is your personnal assistant to help you validate your business ideas, whether it is a startup, an app, an algorithm or anything else!

Our bot will help you to:
- **Identify the most promising ideas your have:** A dashboard to help you evaluate the potential of each of your ideas. Identify your future gems with simple indicators.
- **Develop your ideas step-by-step:** Sketch out your concept, research your market, determine your setup costs, and make financial forecasts—from lightbulb to launch, figure out everything you need to start your business off on the right foot. Find new sources of inspiration, make the most of their lessons, find your future collaborators or consider potential partnerships.
- **Find similar projects around the world in one click:** We carry out for you a state of the art of similar projects around the globe.
- **Get valuable feedbacks in days:** By analyzing the feedbacks from potential customers, you can better understand their expectations, identify the strengths and weaknesses of your ideas and adapt it accordingly.

STIV is compatible with many tools!

<TODO>

## Give us feedbacks

Tell us what are the main features you would like to have: [GO TO THE SURVEY](https://docs.google.com/forms/d/e/1FAIpQLSeGtKxOjLO57NSpSwdnLebfLFwrPg7XzPMUFC-i8lhPih9bzQ/viewform) 

## How it works

1. Download the GitHub App
2. Allow acces to your private repository
3. Create an issue describing your idea
4. Follow the instructions

## Setup

```sh
# Install dependencies
npm install

# Run the bot
npm start
```

## Docker

```sh
# 1. Build container
docker build -t ideal .

# 2. Start container
docker run -e APP_ID=<app-id> -e PRIVATE_KEY=<pem-value> ideal
```

## Contributing

If you have suggestions for how ideal could be improved, or want to report a bug, open an issue! We'd love all and any contributions.

For more, check out the [Contributing Guide](CONTRIBUTING.md).

## License

[ISC](LICENSE) © 2023 ideal
