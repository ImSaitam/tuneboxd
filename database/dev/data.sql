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
-- Data for Name: artists; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.artists (id, name, spotify_id, image_url, genres, popularity, followers_count, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: albums; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.albums (id, name, artist_id, spotify_id, image_url, release_date, total_tracks, created_at, updated_at, artist_name) FROM stdin;
2	Global Warming	\N	4aawyAB9vmqN3uQ7FjRGTy	https://i.scdn.co/image/ab67616d0000b273c4d0ee0f34f2e8c2b5f31d1a	2012-11-19	0	2025-06-18 11:45:48.58592	2025-06-18 11:45:48.58592	Pitbull
3	Por cesárea	\N	633jS6fM44Zbr1gyI0eF19	https://i.scdn.co/image/ab67616d0000b27378d066acf66eb772239cca78	2024-04-26	0	2025-06-18 11:48:01.163378	2025-06-18 11:48:01.163378	Dillom
4	Ado's Best Adobum	\N	4G1L7sZheq5RAFNbqSbp3O	https://i.scdn.co/image/ab67616d0000b2737e39bafe4f50dd5e15cfe9b0	2025-04-08	0	2025-06-18 12:25:13.624087	2025-06-18 12:25:13.624087	Ado
5	La Grasa de las Capitales: Edición 40º Aniversario (2019 Remasterizado)	\N	5lp7CMQbROn0mpFWZLaPf3	https://i.scdn.co/image/ab67616d0000b273d9172a63ab39eae0bcafcb14	2019-12-20	0	2025-06-18 14:50:07.166519	2025-06-18 14:50:07.166519	Serú Girán
6	UTA'S SONGS ONE PIECE FILM RED	\N	7Ixqxq13tWhrbnIabk3172	https://i.scdn.co/image/ab67616d0000b2730cbecafa929898c82adc519c	2022-08-10	0	2025-06-19 19:58:46.054677	2025-06-19 19:58:46.054677	Ado
7	LONG SEASON	\N	4EX1fAypgQC9wDjGI5QzbZ	https://i.scdn.co/image/ab67616d0000b273f9f1de08fccfce6067fbd225	1996-10-25	0	2025-06-20 04:33:39.854819	2025-06-20 04:33:39.854819	Fishmans
8	FLYING BEAGLE	\N	3rtHKkpPLmiwHNiHA0Kr3d	https://i.scdn.co/image/ab67616d0000b27382448b157380d980b97c820f	1987-10-21	0	2025-06-20 05:12:00.458408	2025-06-20 05:12:00.458408	菊池ひみこ
9	PACIFIC	\N	6PnbwR4pgQQZDrLUdw6Kc7	https://i.scdn.co/image/ab67616d0000b273a7177b1d4c69494024e02579	1978-01-01	0	2025-06-20 05:18:23.594495	2025-06-20 05:18:23.594495	Haruomi Hosono
10	Fina Estampa	\N	6fBP4q8gYKo4LU9V6zVT3i	https://i.scdn.co/image/ab67616d0000b273795193773593a1dae9bc0b12	1994-01-01	0	2025-06-20 18:43:48.328212	2025-06-20 18:43:48.328212	Caetano Veloso
11	Travelling Without Moving (Remastered)	\N	4yrrPNjd9RcqnuDnoEhlER	https://i.scdn.co/image/ab67616d0000b2736407aa9a5e5215cf554ad5d1	1996-09-09	0	2025-06-20 20:56:04.031464	2025-06-20 20:56:04.031464	Jamiroquai
12	FANÁTICO	\N	5S6TLyMgO3WBE3v8FISDOw	https://i.scdn.co/image/ab67616d0000b273fa5d0f60d3acd25af6b0637b	2024-09-27	0	2025-06-20 22:20:40.48694	2025-06-20 22:20:40.48694	Lali
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, username, email, password_hash, email_verified, verification_token, verification_token_expires, reset_password_token, reset_password_expires, profile_image, bio, location, website, privacy, created_at, updated_at) FROM stdin;
15	antods	antods003@gmail.com	$2b$10$SiaLo22PeFcMDWVB1K5JEeZ9H3tJujP45MFeM2a8b.ldfz.3PZe6a	t	\N	\N	\N	\N	\N	\N	\N	\N	public	2025-06-20 18:41:51.246014	2025-06-20 18:42:12.28423
14	ImSaitam	matutedesanto@gmail.com	$2b$10$fssVKPi.JewiZvCRK2GuCu4tPBJclSc6X7JM2clXOF9HSToq9CleO	t	\N	\N	\N	\N	https://media1.tenor.com/m/Bv6sPMO0UucAAAAd/masayoshi-takanaka-takanaka.gif	\N	\N	\N	public	2025-06-19 22:30:55.288257	2025-06-20 23:39:54.163911
\.


--
-- Data for Name: artist_follows; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.artist_follows (id, user_id, artist_id, artist_name, artist_image, created_at) FROM stdin;
3	14	6mEQK9m2krja6X1cfsAjfl	Ado	https://i.scdn.co/image/ab6761610000e5ebbcb1c184c322688f10cdce7a	2025-06-20 18:04:35.496872
4	14	4cJD9t5QBFTUQcd3xfbOb2	Dillom	https://i.scdn.co/image/ab6761610000e5eb9c296070f7d5fe5fad5f6bb0	2025-06-20 18:19:40.144293
5	15	7HGNYPmbDrMkylWqeFCOIQ	Caetano Veloso	https://i.scdn.co/image/ab6761610000e5ebc9cfb41f1889a4d794d54fc8	2025-06-20 18:43:12.73068
6	14	6J7biCazzYhU3gM9j1wfid	Jamiroquai	https://i.scdn.co/image/ab6761610000e5eb7e6dca959714339b69e9718d	2025-06-20 20:55:52.204794
\.


--
-- Data for Name: follows; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.follows (id, follower_id, following_id, created_at) FROM stdin;
1	14	15	2025-06-20 18:45:31.969817
2	15	14	2025-06-20 18:52:44.458934
\.


--
-- Data for Name: forum_replies; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.forum_replies (id, thread_id, user_id, content, likes_count, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: forum_reply_likes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.forum_reply_likes (id, user_id, reply_id, created_at) FROM stdin;
\.


--
-- Data for Name: forum_thread_likes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.forum_thread_likes (id, user_id, thread_id, created_at) FROM stdin;
1	2	3	2025-06-19 14:35:27.385794
2	14	5	2025-06-20 06:19:27.71827
3	15	5	2025-06-20 18:51:54.896733
\.


--
-- Data for Name: forum_threads; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.forum_threads (id, user_id, title, content, category, language, is_pinned, is_locked, replies_count, likes_count, created_at, updated_at, last_activity) FROM stdin;
5	14	🎵 ¡Bienvenidos a TuneBoxd! - Guía de la Comunidad	# 🎶 ¡Bienvenidos a TuneBoxd!\n\n¡Hola y bienvenidos a **TuneBoxd**, la red social definitiva para amantes de la música!\n\n---\n\n## 🌟 ¿Qué es TuneBoxd?\n\nTuneBoxd es tu espacio para descubrir, compartir y conectar a través de la música. Aquí puedes:\n\n### 📝 Reseñas y Calificaciones\n\n- Escribe reseñas detalladas de tus álbumes favoritos  \n- Califica música con nuestro sistema de 5 estrellas  \n- Descubre nueva música a través de las recomendaciones de la comunidad  \n\n### 👥 Comunidad y Conexiones\n\n- Sigue a otros melómanos con gustos similares  \n- Participa en discusiones sobre tus artistas favoritos  \n- Comparte tu historial de escucha y descubrimientos  \n\n### 📊 Seguimiento Personal\n\n- Mantén un registro de toda la música que escuchas  \n- Crea listas personalizadas de álbumes  \n- Ve tus estadísticas musicales y tendencias  \n\n---\n\n## 🎯 Cómo Empezar\n\n1. **Completa tu perfil**  \n   Agrega una foto y biografía que refleje tu pasión musical.\n\n2. **Escribe tu primera reseña**  \n   Comparte tu opinión sobre un álbum que te haya marcado.\n\n3. **Explora la comunidad**  \n   Busca usuarios con gustos similares y síguelos.\n\n4. **Participa en el foro**  \n   Únete a las conversaciones sobre música.\n\n---\n\n## 📋 Reglas de la Comunidad\n\nPara mantener un ambiente positivo y respetuoso:\n\n- **Respeto mutuo**: Trata a todos los miembros con cortesía  \n- **Constructividad**: Las críticas deben ser constructivas y argumentadas  \n- **Diversidad musical**: Respetamos todos los géneros y gustos musicales  \n- **No spam**: Evita el contenido repetitivo o publicitario  \n- **Contenido apropiado**: Mantén las discusiones relacionadas con música  \n\n---\n\n## 🏷️ Categorías del Foro\n\n- **General**: Conversaciones generales sobre música  \n- **Recomendaciones**: Comparte y pide recomendaciones musicales  \n- **Reseñas**: Discute reseñas y análisis de álbumes  \n- **Discusión**: Debates profundos sobre música y tendencias  \n- **Noticias**: Últimas noticias del mundo musical  \n\n---\n\n## 💡 Tips para Nuevos Usuarios\n\n1. **Sé auténtico**  \n   Comparte tu verdadera pasión por la música.\n\n2. **Explora géneros**  \n   No te limites, explora nuevos sonidos.\n\n3. **Interactúa**  \n   Comenta en las reseñas de otros usuarios.\n\n4. **Sé paciente**  \n   Construir una red musical lleva tiempo.\n\n---\n\n## 🔗 Enlaces Útiles\n\n- [Página Principal](https://tuneboxd.xyz)  \n- [Explorar Álbumes](https://tuneboxd.xyz/search)  \n- [Perfiles de Usuarios](https://tuneboxd.xyz/social)  \n\n---\n\n## 📞 ¿Necesitas Ayuda?\n\nSi tienes preguntas o necesitas asistencia:\n\n- Responde a este hilo  \n- Busca en la categoría **General** del foro  \n\n---\n\n**¡Que comience tu viaje musical en TuneBoxd!** 🚀  \n*¿Cuál fue el último álbum que te voló la cabeza? ¡Compártelo en los comentarios!*\n\n---\n\n*Hilo oficial de bienvenida - Fijado por el equipo de TuneBoxd*	general	es	f	f	0	2	2025-06-20 04:32:56.663952	2025-06-20 04:32:56.663952	2025-06-20 04:32:56.663952
\.


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.reviews (id, user_id, spotify_album_id, rating, review_text, is_private, created_at, updated_at) FROM stdin;
3	14	4EX1fAypgQC9wDjGI5QzbZ	4	\N	f	2025-06-20 05:10:23.93821	2025-06-20 05:10:23.93821
4	14	3rtHKkpPLmiwHNiHA0Kr3d	5	\N	f	2025-06-20 05:13:00.060976	2025-06-20 05:13:00.060976
5	14	6PnbwR4pgQQZDrLUdw6Kc7	4	\N	f	2025-06-20 05:18:35.718632	2025-06-20 05:18:35.718632
\.


--
-- Data for Name: likes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.likes (id, user_id, review_id, created_at) FROM stdin;
\.


--
-- Data for Name: lists; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.lists (id, user_id, name, description, is_private, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: list_albums; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.list_albums (id, list_id, spotify_album_id, order_index, created_at, notes, updated_at) FROM stdin;
\.


--
-- Data for Name: list_comments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.list_comments (id, list_id, user_id, content, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: list_likes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.list_likes (id, list_id, user_id, created_at) FROM stdin;
\.


--
-- Data for Name: listening_history; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.listening_history (id, user_id, album_id, track_id, listened_at, created_at) FROM stdin;
8	14	7	\N	2025-06-20 05:10:23.961	2025-06-20 05:10:23.965232
9	14	8	\N	2025-06-20 05:12:06.366	2025-06-20 05:12:06.326988
10	14	9	\N	2025-06-20 05:18:28.96	2025-06-20 05:18:29.063333
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.notifications (id, user_id, type, title, message, data, read, created_at, from_user_id, list_id, thread_id, comment_id, is_read) FROM stdin;
\.


--
-- Data for Name: review_likes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.review_likes (id, review_id, user_id, created_at) FROM stdin;
2	5	14	2025-06-20 06:17:44.616067+00
\.


--
-- Data for Name: track_favorites; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.track_favorites (id, user_id, track_id, track_name, artist_name, album_name, image_url, duration_ms, added_at) FROM stdin;
\.


--
-- Data for Name: watchlist; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.watchlist (id, user_id, album_id, added_at) FROM stdin;
\.


--
-- Name: albums_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.albums_id_seq', 12, true);


--
-- Name: artist_follows_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.artist_follows_id_seq', 6, true);


--
-- Name: artists_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.artists_id_seq', 1, false);


--
-- Name: follows_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.follows_id_seq', 2, true);


--
-- Name: forum_replies_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.forum_replies_id_seq', 3, true);


--
-- Name: forum_reply_likes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.forum_reply_likes_id_seq', 1, true);


--
-- Name: forum_thread_likes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.forum_thread_likes_id_seq', 3, true);


--
-- Name: forum_threads_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.forum_threads_id_seq', 5, true);


--
-- Name: likes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.likes_id_seq', 1, false);


--
-- Name: list_albums_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.list_albums_id_seq', 2, true);


--
-- Name: list_comments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.list_comments_id_seq', 1, true);


--
-- Name: list_likes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.list_likes_id_seq', 1, true);


--
-- Name: listening_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.listening_history_id_seq', 16, true);


--
-- Name: lists_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.lists_id_seq', 5, true);


--
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.notifications_id_seq', 14, true);


--
-- Name: review_likes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.review_likes_id_seq', 2, true);


--
-- Name: reviews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.reviews_id_seq', 17, true);


--
-- Name: track_favorites_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.track_favorites_id_seq', 1, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 15, true);


--
-- Name: watchlist_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.watchlist_id_seq', 2, true);


--
-- PostgreSQL database dump complete
--

