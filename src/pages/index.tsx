import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { FiCalendar, FiUser } from 'react-icons/fi';
import { posts as rawPosts } from '../data/posts';

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

interface FormattedPost {
  slug: string;
  createdAt: string;
  title: string;
  subtitle: string;
  author: string;
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  posts: FormattedPost[];
}

export default function Home({ posts }: HomeProps): JSX.Element {
  return (
    <>
      <Head>
        <title>Home | spacetraveling.</title>
      </Head>
      <main className={styles.content}>
        <div className={styles.posts}>
          {posts.map(post => (
            <Link href={`/post/${post.slug}`} key={post.slug}>
              <a className={styles.post}>
                <strong>{post.title}</strong>
                <p>{post.subtitle}</p>
                <div className="info">
                  <time>
                    <FiCalendar />
                    {post.createdAt}
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
        <button type="button" className={styles.morePostsButton}>
          Carregar mais posts
        </button>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  // const prismic = getPrismicClient({});
  // const postsResponse = await prismic.getByType(TODO);

  return {
    props: {
      posts: rawPosts.map(post => ({
        slug: post.uid,
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
        createdAt: post.first_publication_date,
      })) as FormattedPost[],
    },
    revalidate: 60 * 60, // ONE HOUR
  };
};
