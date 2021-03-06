import ReactGA from 'react-ga';
import { setAppName, setVersion } from './config';
import { setAppColors } from './styles/colors';
import routes from './routes/topicRoutes';
import initializeApp from './index';

/**
 * This serves as the primary entry point to the Media Cloud Topic Mapper app.
 */

ReactGA.initialize('UA-60744513-7');

setVersion('1.11.4');

setAppName('topics');

setAppColors({
  light: '#daf3ee',
  dark: '#47c4ac',
  darker: '#448e80',
});

initializeApp(routes);
