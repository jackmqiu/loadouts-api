import Mongo from './mongo';
// import Activity from './activity';
// import Scaffold from './scaffold';
// import ScaffoldBlock from './scaffoldBlock';
// import Category from './category';
// import User from './user';

export default (config) => {
  // const pgModels = PG(config.pg);
  // const categoryQueries = new Category(pgModels);
  // const activityQueries = new Activity(pgModels);
  // const scaffoldQueries = new Scaffold(pgModels);
  // const scaffoldBlockQueries = new ScaffoldBlock(pgModels);


  // TODO: move the pgModels to their own key to avoid name conflicts,
  // i.e., brand overriding pgModels.brand
  const models = {
    // categoryQueries,
    // activityQueries,
    // scaffoldQueries,
    // scaffoldBlockQueries,
    // User,
  };

  return Object.assign(Mongo, models);
};
