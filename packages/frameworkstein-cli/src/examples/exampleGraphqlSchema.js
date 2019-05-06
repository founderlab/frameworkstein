export const schema = `
  type Author {
    id: Int!
    firstName: String
    lastName: String
    posts: [Post]
  }
  type Post {
    id: Int!
    title: String
    author: Author
    votes: Int
  }
`
