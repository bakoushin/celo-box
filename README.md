# The Box: collect money for any goal

The Box makes it easy to collect money for any goal: collective gift, donations, fundraising, or even personal savings in cUSD or CELO.

Deployed on Celo Mainnet and Alfajores as well.

## Video

[<img src="https://img.youtube.com/vi/9-d1uzAP7A8/maxresdefault.jpg" width="50%">](https://youtu.be/9-d1uzAP7A8)

## Demo

### Expo

On your mobile device:

Step 1. Install [Expo Client](https://expo.io/tools#client)

Step 2. Scan the QR code:

![Expo QR code][expo-qrcode]

https://expo.io/@bakoushin/projects/celo-box

### Android

Download APK from [releases page](https://github.com/bakoushin/celo-box/releases/tag/v0.0.1)

## Use case: banking the unbanked

One of the promises of cryptocurrencies is "banking the unbanked" aiming to make financial services universally available. Smart contracts help make this promise a reality enabling the creation of robust financial services with a just few lines of code. Everyone can create a bank for everyone.

The Box brings to the table one of such services: **a way to collect money for any goal**.

### Collect from many

This includes all possible use cases where people have to collect money from many counterparties:

- Collective gift for birthday, wedding, etc.
- Donations for a specific cause (eg. church renovation)
- Fundraising for a project (think of Kickstarter)

### Personal goals

Even one person could make use of The Box as a savings account. They could set a goal and start saving money towards that goal. Examples are:

- Education for kids
- New equipment for small business

Use cases are endless.

## Philosophy: do one thing well

The Box leverages UNIX’s philosophy of "do one thing well". Instead of creating a swiss-army knife-like superapp with a myriad of functions, The Box focuses on making a way to collect money for a given goal as simple and robust as possible.

In the world of smart contracts, people don't have to be tied to just a few financial service providers. Instead, they could choose from the multitude of them the one they find most convenient for their particular needs.

That means The Box isn't intended to solve the money collection problem once and forever. It is rather meant to be one of the possible approaches, amongst many.

## Basic functionality

### Public Boxes

#### Creating a box

The public box must have a measurable goal in cUSD or CELO. The creator of the box may describe the goal of the box, and the cover image to make it stand out.

Public boxes are displayed in the feed of the app in reverse chronological order (new ones are on the top).

Link to every box can be shared within the community, so the creators could promote their boxes by any available means.

#### Contributing to a box

Everyone could contribute to a box using their Valora wallet.

Before the box is redeemed, any contributor can revoke their contribution for any reason.

#### Redeeming a box

Once the goal is fulfilled, the box may be redeemed by the creator itself, or the creator may like to specify another receiver if the money is collected for a specific recipient.

### Personal Boxes

Personal boxes have the same properties as the public ones, except they are not listed in the app feed.

> Note. Personal boxes aren't private in any way given the nature of public blockchain. An interested party could find that box and all of its transactions on-chain.

## Deployment

The Box uses [Firebase](https://firebase.google.com/) Firestore and Firebase Storage to store box metadata, such as description and cover image.

Firebase configuration must be provided in `.env` file. See `.env.example` provided.

## Future Plans

- [ ] Deploy to the AppStore and Play Market
- [ ] Proper backend (Celo full node with GraphQL endpoint)
- [ ] Dark theme
- [ ] Web frontend
- [ ] Support cEUR (as soon as it will be released)
- [ ] WalletConnect integration
- [ ] Money pools integration (Moola, Ubeswap)

## Author

Alex Bakoushin

## License

MIT

[expo-qrcode]: ./expo-qrcode.png 'Expo QR-code'
