--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5
-- Dumped by pg_dump version 17.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: albums; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.albums (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    artist_id integer,
    spotify_id character varying(255),
    image_url text,
    release_date date,
    total_tracks integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    artist_name character varying(255)
);


--
-- Name: albums_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.albums_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: albums_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.albums_id_seq OWNED BY public.albums.id;


--
-- Name: artist_follows; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.artist_follows (
    id integer NOT NULL,
    user_id integer,
    artist_id text NOT NULL,
    artist_name text NOT NULL,
    artist_image text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: artist_follows_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.artist_follows_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: artist_follows_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.artist_follows_id_seq OWNED BY public.artist_follows.id;


--
-- Name: artists; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.artists (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    spotify_id character varying(255),
    image_url text,
    genres text,
    popularity integer DEFAULT 0,
    followers_count integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: artists_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.artists_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: artists_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.artists_id_seq OWNED BY public.artists.id;


--
-- Name: follows; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.follows (
    id integer NOT NULL,
    follower_id integer NOT NULL,
    following_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: follows_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.follows_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: follows_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.follows_id_seq OWNED BY public.follows.id;


--
-- Name: forum_replies; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.forum_replies (
    id integer NOT NULL,
    thread_id integer NOT NULL,
    user_id integer NOT NULL,
    content text NOT NULL,
    likes_count integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: forum_replies_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.forum_replies_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: forum_replies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.forum_replies_id_seq OWNED BY public.forum_replies.id;


--
-- Name: forum_reply_likes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.forum_reply_likes (
    id integer NOT NULL,
    user_id integer NOT NULL,
    reply_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: forum_reply_likes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.forum_reply_likes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: forum_reply_likes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.forum_reply_likes_id_seq OWNED BY public.forum_reply_likes.id;


--
-- Name: forum_thread_likes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.forum_thread_likes (
    id integer NOT NULL,
    user_id integer NOT NULL,
    thread_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: forum_thread_likes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.forum_thread_likes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: forum_thread_likes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.forum_thread_likes_id_seq OWNED BY public.forum_thread_likes.id;


--
-- Name: forum_threads; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.forum_threads (
    id integer NOT NULL,
    user_id integer NOT NULL,
    title character varying(255) NOT NULL,
    content text NOT NULL,
    category character varying(50) DEFAULT 'General'::character varying,
    language character varying(10) DEFAULT 'es'::character varying,
    is_pinned boolean DEFAULT false,
    is_locked boolean DEFAULT false,
    replies_count integer DEFAULT 0,
    likes_count integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    last_activity timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: forum_threads_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.forum_threads_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: forum_threads_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.forum_threads_id_seq OWNED BY public.forum_threads.id;


--
-- Name: likes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.likes (
    id integer NOT NULL,
    user_id integer NOT NULL,
    review_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: likes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.likes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: likes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.likes_id_seq OWNED BY public.likes.id;


--
-- Name: list_albums; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.list_albums (
    id integer NOT NULL,
    list_id integer NOT NULL,
    spotify_album_id character varying(255) NOT NULL,
    order_index integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    notes text,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: list_albums_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.list_albums_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: list_albums_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.list_albums_id_seq OWNED BY public.list_albums.id;


--
-- Name: list_comments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.list_comments (
    id integer NOT NULL,
    list_id integer NOT NULL,
    user_id integer NOT NULL,
    content text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: list_comments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.list_comments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: list_comments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.list_comments_id_seq OWNED BY public.list_comments.id;


--
-- Name: list_likes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.list_likes (
    id integer NOT NULL,
    list_id integer NOT NULL,
    user_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: list_likes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.list_likes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: list_likes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.list_likes_id_seq OWNED BY public.list_likes.id;


--
-- Name: listening_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.listening_history (
    id integer NOT NULL,
    user_id integer,
    album_id integer,
    track_id text,
    listened_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: listening_history_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.listening_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: listening_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.listening_history_id_seq OWNED BY public.listening_history.id;


--
-- Name: lists; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.lists (
    id integer NOT NULL,
    user_id integer NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    is_private boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: lists_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.lists_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: lists_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.lists_id_seq OWNED BY public.lists.id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    id integer NOT NULL,
    user_id integer NOT NULL,
    type character varying(50) NOT NULL,
    title character varying(255) NOT NULL,
    message text NOT NULL,
    data jsonb,
    read boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    from_user_id integer,
    list_id integer,
    thread_id integer,
    comment_id integer,
    is_read boolean DEFAULT false
);


--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- Name: review_likes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.review_likes (
    id integer NOT NULL,
    review_id integer NOT NULL,
    user_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: review_likes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.review_likes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: review_likes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.review_likes_id_seq OWNED BY public.review_likes.id;


--
-- Name: reviews; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reviews (
    id integer NOT NULL,
    user_id integer NOT NULL,
    spotify_album_id character varying(255) NOT NULL,
    rating integer NOT NULL,
    review_text text,
    is_private boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT reviews_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


--
-- Name: reviews_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.reviews_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: reviews_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.reviews_id_seq OWNED BY public.reviews.id;


--
-- Name: track_favorites; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.track_favorites (
    id integer NOT NULL,
    user_id integer NOT NULL,
    track_id character varying(255) NOT NULL,
    track_name character varying(255),
    artist_name character varying(255),
    album_name character varying(255),
    image_url text,
    duration_ms integer,
    added_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: track_favorites_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.track_favorites_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: track_favorites_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.track_favorites_id_seq OWNED BY public.track_favorites.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    email_verified boolean DEFAULT false,
    verification_token character varying(255),
    verification_token_expires timestamp without time zone,
    reset_password_token character varying(255),
    reset_password_expires timestamp without time zone,
    profile_image character varying(255) DEFAULT NULL::character varying,
    bio text,
    location character varying(255) DEFAULT NULL::character varying,
    website character varying(255) DEFAULT NULL::character varying,
    privacy character varying(20) DEFAULT 'public'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: watchlist; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.watchlist (
    id integer NOT NULL,
    user_id integer,
    album_id integer,
    added_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: watchlist_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.watchlist_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: watchlist_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.watchlist_id_seq OWNED BY public.watchlist.id;


--
-- Name: albums id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.albums ALTER COLUMN id SET DEFAULT nextval('public.albums_id_seq'::regclass);


--
-- Name: artist_follows id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.artist_follows ALTER COLUMN id SET DEFAULT nextval('public.artist_follows_id_seq'::regclass);


--
-- Name: artists id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.artists ALTER COLUMN id SET DEFAULT nextval('public.artists_id_seq'::regclass);


--
-- Name: follows id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.follows ALTER COLUMN id SET DEFAULT nextval('public.follows_id_seq'::regclass);


--
-- Name: forum_replies id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.forum_replies ALTER COLUMN id SET DEFAULT nextval('public.forum_replies_id_seq'::regclass);


--
-- Name: forum_reply_likes id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.forum_reply_likes ALTER COLUMN id SET DEFAULT nextval('public.forum_reply_likes_id_seq'::regclass);


--
-- Name: forum_thread_likes id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.forum_thread_likes ALTER COLUMN id SET DEFAULT nextval('public.forum_thread_likes_id_seq'::regclass);


--
-- Name: forum_threads id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.forum_threads ALTER COLUMN id SET DEFAULT nextval('public.forum_threads_id_seq'::regclass);


--
-- Name: likes id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.likes ALTER COLUMN id SET DEFAULT nextval('public.likes_id_seq'::regclass);


--
-- Name: list_albums id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.list_albums ALTER COLUMN id SET DEFAULT nextval('public.list_albums_id_seq'::regclass);


--
-- Name: list_comments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.list_comments ALTER COLUMN id SET DEFAULT nextval('public.list_comments_id_seq'::regclass);


--
-- Name: list_likes id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.list_likes ALTER COLUMN id SET DEFAULT nextval('public.list_likes_id_seq'::regclass);


--
-- Name: listening_history id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.listening_history ALTER COLUMN id SET DEFAULT nextval('public.listening_history_id_seq'::regclass);


--
-- Name: lists id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lists ALTER COLUMN id SET DEFAULT nextval('public.lists_id_seq'::regclass);


--
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- Name: review_likes id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.review_likes ALTER COLUMN id SET DEFAULT nextval('public.review_likes_id_seq'::regclass);


--
-- Name: reviews id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews ALTER COLUMN id SET DEFAULT nextval('public.reviews_id_seq'::regclass);


--
-- Name: track_favorites id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.track_favorites ALTER COLUMN id SET DEFAULT nextval('public.track_favorites_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: watchlist id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.watchlist ALTER COLUMN id SET DEFAULT nextval('public.watchlist_id_seq'::regclass);


--
-- Name: albums albums_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.albums
    ADD CONSTRAINT albums_pkey PRIMARY KEY (id);


--
-- Name: albums albums_spotify_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.albums
    ADD CONSTRAINT albums_spotify_id_key UNIQUE (spotify_id);


--
-- Name: artist_follows artist_follows_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.artist_follows
    ADD CONSTRAINT artist_follows_pkey PRIMARY KEY (id);


--
-- Name: artist_follows artist_follows_user_id_artist_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.artist_follows
    ADD CONSTRAINT artist_follows_user_id_artist_id_key UNIQUE (user_id, artist_id);


--
-- Name: artists artists_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.artists
    ADD CONSTRAINT artists_pkey PRIMARY KEY (id);


--
-- Name: artists artists_spotify_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.artists
    ADD CONSTRAINT artists_spotify_id_key UNIQUE (spotify_id);


--
-- Name: follows follows_follower_id_following_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.follows
    ADD CONSTRAINT follows_follower_id_following_id_key UNIQUE (follower_id, following_id);


--
-- Name: follows follows_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.follows
    ADD CONSTRAINT follows_pkey PRIMARY KEY (id);


--
-- Name: forum_replies forum_replies_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.forum_replies
    ADD CONSTRAINT forum_replies_pkey PRIMARY KEY (id);


--
-- Name: forum_reply_likes forum_reply_likes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.forum_reply_likes
    ADD CONSTRAINT forum_reply_likes_pkey PRIMARY KEY (id);


--
-- Name: forum_reply_likes forum_reply_likes_user_id_reply_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.forum_reply_likes
    ADD CONSTRAINT forum_reply_likes_user_id_reply_id_key UNIQUE (user_id, reply_id);


--
-- Name: forum_thread_likes forum_thread_likes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.forum_thread_likes
    ADD CONSTRAINT forum_thread_likes_pkey PRIMARY KEY (id);


--
-- Name: forum_thread_likes forum_thread_likes_user_id_thread_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.forum_thread_likes
    ADD CONSTRAINT forum_thread_likes_user_id_thread_id_key UNIQUE (user_id, thread_id);


--
-- Name: forum_threads forum_threads_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.forum_threads
    ADD CONSTRAINT forum_threads_pkey PRIMARY KEY (id);


--
-- Name: likes likes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.likes
    ADD CONSTRAINT likes_pkey PRIMARY KEY (id);


--
-- Name: likes likes_user_id_review_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.likes
    ADD CONSTRAINT likes_user_id_review_id_key UNIQUE (user_id, review_id);


--
-- Name: list_albums list_albums_list_id_spotify_album_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.list_albums
    ADD CONSTRAINT list_albums_list_id_spotify_album_id_key UNIQUE (list_id, spotify_album_id);


--
-- Name: list_albums list_albums_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.list_albums
    ADD CONSTRAINT list_albums_pkey PRIMARY KEY (id);


--
-- Name: list_comments list_comments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.list_comments
    ADD CONSTRAINT list_comments_pkey PRIMARY KEY (id);


--
-- Name: list_likes list_likes_list_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.list_likes
    ADD CONSTRAINT list_likes_list_id_user_id_key UNIQUE (list_id, user_id);


--
-- Name: list_likes list_likes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.list_likes
    ADD CONSTRAINT list_likes_pkey PRIMARY KEY (id);


--
-- Name: listening_history listening_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.listening_history
    ADD CONSTRAINT listening_history_pkey PRIMARY KEY (id);


--
-- Name: lists lists_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lists
    ADD CONSTRAINT lists_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: review_likes review_likes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.review_likes
    ADD CONSTRAINT review_likes_pkey PRIMARY KEY (id);


--
-- Name: review_likes review_likes_review_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.review_likes
    ADD CONSTRAINT review_likes_review_id_user_id_key UNIQUE (review_id, user_id);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- Name: track_favorites track_favorites_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.track_favorites
    ADD CONSTRAINT track_favorites_pkey PRIMARY KEY (id);


--
-- Name: track_favorites track_favorites_user_id_track_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.track_favorites
    ADD CONSTRAINT track_favorites_user_id_track_id_key UNIQUE (user_id, track_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: watchlist watchlist_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.watchlist
    ADD CONSTRAINT watchlist_pkey PRIMARY KEY (id);


--
-- Name: watchlist watchlist_user_id_album_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.watchlist
    ADD CONSTRAINT watchlist_user_id_album_id_key UNIQUE (user_id, album_id);


--
-- Name: idx_albums_artist_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_albums_artist_id ON public.albums USING btree (artist_id);


--
-- Name: idx_albums_spotify_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_albums_spotify_id ON public.albums USING btree (spotify_id);


--
-- Name: idx_artist_follows_artist_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_artist_follows_artist_id ON public.artist_follows USING btree (artist_id);


--
-- Name: idx_artist_follows_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_artist_follows_user_id ON public.artist_follows USING btree (user_id);


--
-- Name: idx_artists_spotify_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_artists_spotify_id ON public.artists USING btree (spotify_id);


--
-- Name: idx_follows_follower; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_follows_follower ON public.follows USING btree (follower_id);


--
-- Name: idx_follows_following; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_follows_following ON public.follows USING btree (following_id);


--
-- Name: idx_forum_replies_thread_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_forum_replies_thread_id ON public.forum_replies USING btree (thread_id);


--
-- Name: idx_forum_replies_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_forum_replies_user_id ON public.forum_replies USING btree (user_id);


--
-- Name: idx_forum_reply_likes_reply_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_forum_reply_likes_reply_id ON public.forum_reply_likes USING btree (reply_id);


--
-- Name: idx_forum_reply_likes_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_forum_reply_likes_user_id ON public.forum_reply_likes USING btree (user_id);


--
-- Name: idx_forum_thread_likes_thread_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_forum_thread_likes_thread_id ON public.forum_thread_likes USING btree (thread_id);


--
-- Name: idx_forum_thread_likes_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_forum_thread_likes_user_id ON public.forum_thread_likes USING btree (user_id);


--
-- Name: idx_forum_threads_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_forum_threads_category ON public.forum_threads USING btree (category);


--
-- Name: idx_forum_threads_language; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_forum_threads_language ON public.forum_threads USING btree (language);


--
-- Name: idx_forum_threads_last_activity; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_forum_threads_last_activity ON public.forum_threads USING btree (last_activity DESC);


--
-- Name: idx_forum_threads_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_forum_threads_user_id ON public.forum_threads USING btree (user_id);


--
-- Name: idx_likes_review_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_likes_review_id ON public.likes USING btree (review_id);


--
-- Name: idx_likes_user_review; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_likes_user_review ON public.likes USING btree (user_id, review_id);


--
-- Name: idx_list_albums_list_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_list_albums_list_id ON public.list_albums USING btree (list_id);


--
-- Name: idx_list_albums_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_list_albums_order ON public.list_albums USING btree (list_id, order_index);


--
-- Name: idx_list_albums_spotify_album_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_list_albums_spotify_album_id ON public.list_albums USING btree (spotify_album_id);


--
-- Name: idx_list_comments_list_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_list_comments_list_id ON public.list_comments USING btree (list_id);


--
-- Name: idx_list_comments_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_list_comments_user_id ON public.list_comments USING btree (user_id);


--
-- Name: idx_list_likes_list_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_list_likes_list_id ON public.list_likes USING btree (list_id);


--
-- Name: idx_list_likes_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_list_likes_user_id ON public.list_likes USING btree (user_id);


--
-- Name: idx_listening_history_album_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_listening_history_album_id ON public.listening_history USING btree (album_id);


--
-- Name: idx_listening_history_listened_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_listening_history_listened_at ON public.listening_history USING btree (listened_at);


--
-- Name: idx_listening_history_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_listening_history_user_id ON public.listening_history USING btree (user_id);


--
-- Name: idx_lists_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_lists_created_at ON public.lists USING btree (created_at DESC);


--
-- Name: idx_lists_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_lists_user_id ON public.lists USING btree (user_id);


--
-- Name: idx_notifications_from_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_from_user ON public.notifications USING btree (from_user_id);


--
-- Name: idx_notifications_is_read; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_is_read ON public.notifications USING btree (is_read);


--
-- Name: idx_notifications_list; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_list ON public.notifications USING btree (list_id);


--
-- Name: idx_notifications_read; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_read ON public.notifications USING btree (user_id, read);


--
-- Name: idx_notifications_thread; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_thread ON public.notifications USING btree (thread_id);


--
-- Name: idx_notifications_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_user_id ON public.notifications USING btree (user_id);


--
-- Name: idx_review_likes_review_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_review_likes_review_id ON public.review_likes USING btree (review_id);


--
-- Name: idx_review_likes_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_review_likes_user_id ON public.review_likes USING btree (user_id);


--
-- Name: idx_reviews_album_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reviews_album_id ON public.reviews USING btree (spotify_album_id);


--
-- Name: idx_reviews_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reviews_created_at ON public.reviews USING btree (created_at DESC);


--
-- Name: idx_reviews_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reviews_user_id ON public.reviews USING btree (user_id);


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- Name: idx_users_email_verified; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_email_verified ON public.users USING btree (email_verified);


--
-- Name: idx_users_username; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_username ON public.users USING btree (username);


--
-- Name: idx_watchlist_album_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_watchlist_album_id ON public.watchlist USING btree (album_id);


--
-- Name: idx_watchlist_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_watchlist_user_id ON public.watchlist USING btree (user_id);


--
-- Name: lists update_lists_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_lists_updated_at BEFORE UPDATE ON public.lists FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: reviews update_reviews_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: users update_users_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: albums albums_artist_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.albums
    ADD CONSTRAINT albums_artist_id_fkey FOREIGN KEY (artist_id) REFERENCES public.artists(id) ON DELETE CASCADE;


--
-- Name: artist_follows artist_follows_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.artist_follows
    ADD CONSTRAINT artist_follows_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: follows follows_follower_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.follows
    ADD CONSTRAINT follows_follower_id_fkey FOREIGN KEY (follower_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: follows follows_following_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.follows
    ADD CONSTRAINT follows_following_id_fkey FOREIGN KEY (following_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: likes likes_review_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.likes
    ADD CONSTRAINT likes_review_id_fkey FOREIGN KEY (review_id) REFERENCES public.reviews(id) ON DELETE CASCADE;


--
-- Name: likes likes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.likes
    ADD CONSTRAINT likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: list_albums list_albums_list_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.list_albums
    ADD CONSTRAINT list_albums_list_id_fkey FOREIGN KEY (list_id) REFERENCES public.lists(id) ON DELETE CASCADE;


--
-- Name: list_comments list_comments_list_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.list_comments
    ADD CONSTRAINT list_comments_list_id_fkey FOREIGN KEY (list_id) REFERENCES public.lists(id) ON DELETE CASCADE;


--
-- Name: list_comments list_comments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.list_comments
    ADD CONSTRAINT list_comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: list_likes list_likes_list_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.list_likes
    ADD CONSTRAINT list_likes_list_id_fkey FOREIGN KEY (list_id) REFERENCES public.lists(id) ON DELETE CASCADE;


--
-- Name: list_likes list_likes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.list_likes
    ADD CONSTRAINT list_likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: listening_history listening_history_album_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.listening_history
    ADD CONSTRAINT listening_history_album_id_fkey FOREIGN KEY (album_id) REFERENCES public.albums(id) ON DELETE CASCADE;


--
-- Name: listening_history listening_history_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.listening_history
    ADD CONSTRAINT listening_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: lists lists_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lists
    ADD CONSTRAINT lists_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: review_likes review_likes_review_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.review_likes
    ADD CONSTRAINT review_likes_review_id_fkey FOREIGN KEY (review_id) REFERENCES public.reviews(id) ON DELETE CASCADE;


--
-- Name: review_likes review_likes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.review_likes
    ADD CONSTRAINT review_likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: reviews reviews_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: track_favorites track_favorites_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.track_favorites
    ADD CONSTRAINT track_favorites_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: watchlist watchlist_album_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.watchlist
    ADD CONSTRAINT watchlist_album_id_fkey FOREIGN KEY (album_id) REFERENCES public.albums(id) ON DELETE CASCADE;


--
-- Name: watchlist watchlist_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.watchlist
    ADD CONSTRAINT watchlist_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

