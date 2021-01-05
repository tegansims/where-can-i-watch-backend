const { ApolloServer, gql } = require("apollo-server");
require("dotenv").config();
const axios = require("axios").default;

const searchHeaders = {
  "x-rapidapi-host":
    "utelly-tv-shows-and-movies-availability-v1.p.rapidapi.com",
  "x-rapidapi-key": process.env.API_KEY,
};

const detailsHeaders = {
  "x-rapidapi-host": "imdb8.p.rapidapi.com",
  "x-rapidapi-key": process.env.API_KEY,
};

const SEARCH_URL =
  "https://utelly-tv-shows-and-movies-availability-v1.p.rapidapi.com";
const DETAILS_URL = "https://imdb8.p.rapidapi.com/title/get-overview-details";

const typeDefs = gql`
  type Movie {
    name: String
    picture: String
    locations: [Location]
    external_ids: ExternalIds
  }
  type Location {
    icon: String
    display_name: String
    id: String
    url: String
    image: String
  }
  type ExternalIds {
    imdb: IMDB
  }
  type IMDB {
    url: String
    id: String
  }

  type MovieDetails {
    id: String
    title: String
    releaseDate: String
    plotOutline: String
    plotSummary: String
    image: String
  }

  type Query {
    getMovieBySearchTerm(searchTerm: String): [Movie]
    getMovieDetails(id: String, countryCode: String): MovieDetails
  }
`;

const resolvers = {
  Query: {
    getMovieBySearchTerm: async (_, { searchTerm }) => {
      try {
        const searchedMovies = await axios({
          method: "GET",
          url: `${SEARCH_URL}/lookup?term=${searchTerm}&country=uk`,
          headers: searchHeaders,
        }).then((resp) => resp.data.results);
        return searchedMovies;
      } catch (err) {
        console.log({ err });
      }
    },
    getMovieDetails: async (_, { id, countryCode = "GB" }) => {
      try {
        const details = await axios({
          method: "GET",
          url: `${DETAILS_URL}?currentCountry=${countryCode}&tconst=${id}`,
          headers: detailsHeaders,
        }).then((resp) => resp.data);
        return details;
      } catch (err) {
        console.log({ err });
      }
    },
  },
  Movie: {
    name: ({ name }) => name,
    picture: ({ picture }) => picture,
    locations: ({ locations }) => locations,
    external_ids: ({ external_ids }) => external_ids,
  },
  MovieDetails: {
    id: ({ id }) => id,
    title: ({ title }) => title.title,
    releaseDate: ({ releaseDate }) => releaseDate,
    plotOutline: ({ plotOutline }) => plotOutline && plotOutline.text,
    plotSummary: ({ plotSummary }) => plotSummary && plotSummary.text,
    image: ({ title }) => title.image.url,
  } 
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen({ port: process.env.PORT || 4000 }).then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
