import { useState } from 'react';
import { format } from 'date-fns';

import ptBR from 'date-fns/locale/pt-BR';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { FiCalendar, FiUser } from 'react-icons/fi';

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  const [posts, setPosts] = useState(postsPagination.results);
  const [nextPage, setNextPage] = useState(postsPagination.next_page);

  const loadNextPage = async (): Promise<void> => {
    if (nextPage === null) return;
    const response = await fetch(nextPage).then(res => res.json());
    setNextPage(response.next_page);
    setPosts([...posts, ...response.results]);
  };

  const formattedPosts = posts.map(post => ({
    slug: post.uid,
    title: post.data.title,
    subtitle: post.data.subtitle,
    author: post.data.author,
    createdAt: post.first_publication_date,
  }));
  return (
    <>
      <Head>
        <title>Home | spacetraveling.</title>
      </Head>
      <main className={styles.content}>
        <div className={styles.posts}>
          {formattedPosts.map(post => (
            <Link href={`/post/${post.slug}`} key={post.slug}>
              <a className={styles.post}>
                <strong>{post.title}</strong>
                <p>{post.subtitle}</p>
                <div className={commonStyles.info}>
                  <time>
                    <FiCalendar />
                    {format(new Date(post.createdAt), 'dd MMM yyyy', {
                      locale: ptBR,
                    })}
                  </time>
                  <span>
                    <FiUser />
                    {post.author}
                  </span>
                </div>
              </a>
            </Link>
          ))}
        </div>
        {nextPage && (
          <button
            type="button"
            className={styles.morePostsButton}
            onClick={loadNextPage}
          >
            Carregar mais posts
          </button>
        )}
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient({});
  const response = await prismic.getByType('post');
  return {
    props: {
      postsPagination: {
        next_page: response.next_page,
        results: response.results,
      },
    },
    revalidate: 60 * 60, // ONE HOUR
  };
};
