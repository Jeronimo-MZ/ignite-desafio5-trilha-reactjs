import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import parse from 'html-react-parser';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { RichText } from 'prismic-dom';
import { useRouter } from 'next/router';
import { Fragment } from 'react';
import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

const calculateReadingTime = (post: Post): number => {
  const { content } = post.data;

  const wordsCount = content
    .map(item => {
      return [
        ...item.body.flatMap(t => t.text.split(' ')),
        ...item.heading.split(''),
      ];
    })
    .flatMap(wordsArray => wordsArray).length;
  return Math.ceil(wordsCount / 200);
};

export default function Post({ post }: PostProps): JSX.Element {
  const router = useRouter();

  if (router.isFallback) {
    return <h1>Carregando...</h1>;
  }
  return (
    <>
      <Head>
        <title>${post.data.title} | spacetraveling</title>
      </Head>
      <main className={styles.container}>
        <img src={post.data.banner.url} alt={post.data.title} />
        <article className={styles.post}>
          <h1>{post.data.title}</h1>
          <div className={commonStyles.info}>
            <time>
              <FiCalendar />{' '}
              {format(new Date(post.first_publication_date), 'dd MMM yyyy', {
                locale: ptBR,
              })}
            </time>
            <span>
              <FiUser /> {post.data.author}
            </span>
            <span>
              <FiClock /> {calculateReadingTime(post)} min
            </span>
          </div>
          <div className={styles.content}>
            {post.data.content.map(content => (
              <Fragment key={content.heading}>
                <h2>{content.heading}</h2>
                {parse(RichText.asHtml(content.body))}
              </Fragment>
            ))}
          </div>
        </article>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient({});
  const posts = await prismic.getByType('post');

  return {
    paths: posts.results.map(post => ({ params: { slug: post.uid } })),
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const prismic = getPrismicClient({});
  try {
    const post = await prismic.getByUID('post', params.slug as string);
    return {
      props: { post },
    };
  } catch {
    return {
      notFound: true,
    };
  }
};
