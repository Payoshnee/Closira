import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;
import 'package:image_picker/image_picker.dart';

void main() {
  runApp(const ClorisaMobileApp());
}

class ClorisaMobileApp extends StatelessWidget {
  const ClorisaMobileApp({super.key, this.initialState});

  final ClorisaMobileState? initialState;

  @override
  Widget build(BuildContext context) {
    const seed = Color(0xFF5D6B4F);
    return MaterialApp(
      title: 'Clorisa',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: seed),
        scaffoldBackgroundColor: const Color(0xFFFAF8F3),
        useMaterial3: true,
      ),
      home: ClorisaAppShell(initialState: initialState),
    );
  }
}

class ClorisaAppShell extends StatefulWidget {
  const ClorisaAppShell({super.key, this.initialState});

  final ClorisaMobileState? initialState;

  @override
  State<ClorisaAppShell> createState() => _ClorisaAppShellState();
}

class _ClorisaAppShellState extends State<ClorisaAppShell> {
  late final ClorisaMobileState state =
      widget.initialState ?? ClorisaMobileState();
  int index = 0;

  @override
  void initState() {
    super.initState();
    if (widget.initialState != null) return;
    state.restoreSession().then((_) {
      if (mounted) setState(() {});
    });
  }

  @override
  Widget build(BuildContext context) {
    if (state.isLoadingSession) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    if (!state.isAuthenticated) {
      return AuthScreen(
        onLogin: (email, password) async {
          await state.login(email, password);
          if (mounted) setState(() {});
        },
        onRegister: (name, email, password) async {
          await state.register(name, email, password);
          if (mounted) setState(() {});
        },
        onOfflineDemo: () => setState(state.signInDemoUser),
      );
    }

    final pages = [
      HomeScreen(state: state),
      WardrobeScreen(state: state, onChanged: () => setState(() {})),
      OutfitsScreen(state: state, onChanged: () => setState(() {})),
      AiScreen(state: state),
      ProfileScreen(
        state: state,
        onLogout: () async {
          await state.logout();
          if (mounted) setState(() {});
        },
      ),
    ];

    return Scaffold(
      body: SafeArea(child: pages[index]),
      bottomNavigationBar: NavigationBar(
        selectedIndex: index,
        onDestinationSelected: (value) => setState(() => index = value),
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.space_dashboard_outlined),
            selectedIcon: Icon(Icons.space_dashboard),
            label: 'Home',
          ),
          NavigationDestination(
            icon: Icon(Icons.checkroom_outlined),
            selectedIcon: Icon(Icons.checkroom),
            label: 'Wardrobe',
          ),
          NavigationDestination(
            icon: Icon(Icons.style_outlined),
            selectedIcon: Icon(Icons.style),
            label: 'Outfits',
          ),
          NavigationDestination(
            icon: Icon(Icons.auto_awesome_outlined),
            selectedIcon: Icon(Icons.auto_awesome),
            label: 'AI',
          ),
          NavigationDestination(
            icon: Icon(Icons.person_outline),
            selectedIcon: Icon(Icons.person),
            label: 'Profile',
          ),
        ],
      ),
    );
  }
}

class ClorisaMobileState {
  ClorisaMobileState({
    ClorisaApiClient? apiClient,
    SecureTokenStore? tokenStore,
  }) : api = apiClient ?? ClorisaApiClient(),
       tokens = tokenStore ?? const SecureTokenStore();

  bool isAuthenticated = false;
  bool isLoadingSession = true;
  String? errorMessage;
  String userName = 'Himanshu';
  String email = 'himanshu@example.com';
  final ClorisaApiClient api;
  final SecureTokenStore tokens;
  final imagePicker = ImagePicker();

  final wardrobe = <WardrobeItem>[
    WardrobeItem(
      id: 'demo-1',
      name: 'Ivory linen blazer',
      category: 'Formal Wear',
      color: 'Ivory',
      tags: ['office', 'minimal'],
      favorite: true,
    ),
    WardrobeItem(
      id: 'demo-2',
      name: 'Rose satin dress',
      category: 'Dress',
      color: 'Rose',
      tags: ['wedding', 'evening'],
    ),
    WardrobeItem(
      id: 'demo-3',
      name: 'Charcoal tailored trousers',
      category: 'Bottoms',
      color: 'Charcoal',
      tags: ['office', 'travel'],
    ),
    WardrobeItem(
      id: 'demo-4',
      name: 'Gold strappy heels',
      category: 'Footwear',
      color: 'Gold',
      tags: ['wedding'],
    ),
  ];

  final outfits = <OutfitPlan>[
    OutfitPlan(
      id: 'demo-outfit-1',
      title: 'Clean presentation look',
      occasion: 'Office',
      date: 'Today',
      items: ['Ivory linen blazer', 'Charcoal tailored trousers'],
    ),
    OutfitPlan(
      id: 'demo-outfit-2',
      title: 'Rose and gold wedding guest',
      occasion: 'Wedding',
      date: 'Saturday',
      items: ['Rose satin dress', 'Gold strappy heels'],
    ),
  ];

  Future<void> restoreSession() async {
    final accessToken = await tokens.readAccessToken();
    if (accessToken == null) {
      isLoadingSession = false;
      return;
    }

    try {
      final user = await api.currentUser(accessToken);
      applyUser(user);
      isAuthenticated = true;
      await loadRemoteData();
    } catch (_) {
      await tokens.clear();
      isAuthenticated = false;
    } finally {
      isLoadingSession = false;
    }
  }

  Future<void> login(String email, String password) async {
    errorMessage = null;
    final session = await api.login(email: email, password: password);
    await tokens.save(session.tokens);
    applyUser(session.user);
    isAuthenticated = true;
    await loadRemoteData();
  }

  Future<void> register(String name, String email, String password) async {
    errorMessage = null;
    final session = await api.register(
      name: name,
      email: email,
      password: password,
    );
    await tokens.save(session.tokens);
    applyUser(session.user);
    isAuthenticated = true;
    await loadRemoteData();
  }

  Future<void> logout() async {
    final refreshToken = await tokens.readRefreshToken();
    try {
      await api.logout(refreshToken);
    } finally {
      await tokens.clear();
      isAuthenticated = false;
    }
  }

  Future<void> loadWardrobe() async {
    final apiItems = await authenticated(
      (accessToken) => api.listWardrobe(accessToken),
    );
    wardrobe
      ..clear()
      ..addAll(apiItems);
  }

  Future<void> loadRemoteData() async {
    await loadWardrobe();
    final apiOutfits = await authenticated(
      (accessToken) => api.listOutfits(accessToken),
    );
    outfits
      ..clear()
      ..addAll(apiOutfits);
  }

  Future<void> createWardrobeItem() async {
    final item = await authenticated(
      (accessToken) => api.createWardrobeItem(accessToken, {
        'title': 'New capsule tee',
        'primaryColor': 'White',
        'material': 'Cotton',
        'season': 'All season',
        'notes': 'Added from mobile.',
      }),
    );
    wardrobe.insert(0, item);
  }

  Future<void> toggleFavorite(WardrobeItem item) async {
    if (item.id.startsWith('demo-')) {
      item.favorite = !item.favorite;
      return;
    }
    final updated = await authenticated(
      (accessToken) =>
          api.toggleWardrobeFavorite(accessToken, item.id, !item.favorite),
    );
    replaceWardrobeItem(updated);
  }

  Future<void> markWorn(WardrobeItem item) async {
    if (item.id.startsWith('demo-')) {
      item.lastWorn = 'Today';
      return;
    }
    final updated = await authenticated(
      (accessToken) => api.markWardrobeWorn(accessToken, item.id),
    );
    replaceWardrobeItem(updated);
  }

  Future<void> uploadWardrobeImage(WardrobeItem item) async {
    if (item.id.startsWith('demo-')) return;
    final picked = await imagePicker.pickImage(
      source: ImageSource.gallery,
      imageQuality: 88,
    );
    if (picked == null) return;
    final bytes = await picked.readAsBytes();
    final contentType = contentTypeFor(picked.name);
    await authenticated(
      (accessToken) => api.uploadWardrobeImage(
        accessToken,
        item.id,
        picked.name,
        contentType,
        bytes,
      ),
    );
    await loadWardrobe();
  }

  Future<void> createOutfit() async {
    final outfit = await authenticated(
      (accessToken) => api.createOutfit(
        accessToken,
        wardrobe.take(2).map((item) => item.id).toList(),
      ),
    );
    outfits.insert(0, outfit);
  }

  Future<void> duplicateOutfit(OutfitPlan outfit) async {
    if (outfit.id.startsWith('demo-')) {
      outfits.insert(
        0,
        OutfitPlan(
          id: '${outfit.id}-copy-${outfits.length}',
          title: '${outfit.title} copy',
          occasion: outfit.occasion,
          date: outfit.date,
          items: outfit.items,
        ),
      );
      return;
    }
    final copy = await authenticated(
      (accessToken) => api.duplicateOutfit(accessToken, outfit.id),
    );
    outfits.insert(0, copy);
  }

  Future<String> recommendOutfit(String prompt) async {
    final result = await authenticated(
      (accessToken) => api.recommendOutfit(accessToken, prompt),
    );
    return result;
  }

  Future<String> shoppingCheck(String itemName) async {
    return authenticated(
      (accessToken) => api.shoppingCheck(accessToken, itemName),
    );
  }

  Future<void> updateProfile(String name, String email) async {
    final user = await authenticated(
      (accessToken) => api.updateProfile(accessToken, name, email),
    );
    applyUser(user);
  }

  Future<T> authenticated<T>(
    Future<T> Function(String accessToken) action,
  ) async {
    final accessToken = await tokens.readAccessToken();
    if (accessToken == null) {
      throw ClorisaApiException('You need to sign in again.');
    }
    try {
      return await action(accessToken);
    } on ClorisaUnauthorizedException {
      final refreshed = await api.refresh(await tokens.readRefreshToken());
      await tokens.save(refreshed.tokens);
      applyUser(refreshed.user);
      return action(refreshed.tokens.accessToken);
    }
  }

  void replaceWardrobeItem(WardrobeItem updated) {
    final index = wardrobe.indexWhere((item) => item.id == updated.id);
    if (index == -1) {
      wardrobe.insert(0, updated);
    } else {
      wardrobe[index] = updated;
    }
  }

  void signInDemoUser() {
    isLoadingSession = false;
    isAuthenticated = true;
  }

  void applyUser(AuthUser user) {
    userName = user.name;
    email = user.email;
  }
}

class SecureTokenStore {
  const SecureTokenStore({this.storage = const FlutterSecureStorage()});

  final FlutterSecureStorage storage;

  Future<void> save(AuthTokens tokens) async {
    await storage.write(key: 'clorisa_access_token', value: tokens.accessToken);
    await storage.write(
      key: 'clorisa_refresh_token',
      value: tokens.refreshToken,
    );
  }

  Future<String?> readAccessToken() =>
      storage.read(key: 'clorisa_access_token');

  Future<String?> readRefreshToken() =>
      storage.read(key: 'clorisa_refresh_token');

  Future<void> clear() async {
    await storage.delete(key: 'clorisa_access_token');
    await storage.delete(key: 'clorisa_refresh_token');
  }
}

class ClorisaApiClient {
  ClorisaApiClient({
    this.baseUrl = const String.fromEnvironment(
      'CLORISA_API_URL',
      defaultValue: 'http://localhost:3001/api/v1',
    ),
    http.Client? httpClient,
  }) : _http = httpClient ?? http.Client();

  final String baseUrl;
  final http.Client _http;

  Future<AuthSessionPayload> login({
    required String email,
    required String password,
  }) {
    return _auth('/auth/login', {'email': email, 'password': password});
  }

  Future<AuthSessionPayload> register({
    required String name,
    required String email,
    required String password,
  }) {
    return _auth('/auth/register', {
      'name': name,
      'email': email,
      'password': password,
    });
  }

  Future<void> logout(String? refreshToken) async {
    if (refreshToken == null) return;
    await _http.post(
      endpoint('/auth/logout'),
      headers: jsonHeaders(refreshToken),
    );
  }

  Future<AuthSessionPayload> refresh(String? refreshToken) async {
    if (refreshToken == null) {
      throw ClorisaUnauthorizedException('Missing refresh token.');
    }
    final response = await _http.post(
      endpoint('/auth/refresh'),
      headers: jsonHeaders(refreshToken),
    );
    return AuthSessionPayload.fromJson(decodeResponse(response));
  }

  Future<AuthUser> currentUser(String accessToken) async {
    final response = await _http.get(
      endpoint('/auth/me'),
      headers: authHeaders(accessToken),
    );
    final body = decodeResponse(response);
    return AuthUser.fromJson(body['user'] as Map<String, dynamic>);
  }

  Future<List<WardrobeItem>> listWardrobe(String accessToken) async {
    final response = await _http.get(
      endpoint('/wardrobe/items'),
      headers: authHeaders(accessToken),
    );
    final body = decodeResponse(response);
    final items = body['items'] as List<dynamic>? ?? [];
    return items
        .map((item) => WardrobeItem.fromJson(item as Map<String, dynamic>))
        .toList();
  }

  Future<WardrobeItem> createWardrobeItem(
    String accessToken,
    Map<String, Object?> body,
  ) async {
    final response = await _http.post(
      endpoint('/wardrobe/items'),
      headers: jsonHeaders(accessToken),
      body: jsonEncode(body),
    );
    return WardrobeItem.fromJson(decodeResponse(response));
  }

  Future<WardrobeItem> toggleWardrobeFavorite(
    String accessToken,
    String id,
    bool favorite,
  ) async {
    final response = await _http.patch(
      endpoint('/wardrobe/items/$id/favorite'),
      headers: jsonHeaders(accessToken),
      body: jsonEncode({'isFavorite': favorite}),
    );
    return WardrobeItem.fromJson(decodeResponse(response));
  }

  Future<WardrobeItem> markWardrobeWorn(String accessToken, String id) async {
    final response = await _http.post(
      endpoint('/wardrobe/items/$id/mark-worn'),
      headers: jsonHeaders(accessToken),
      body: jsonEncode({'wornAt': DateTime.now().toIso8601String()}),
    );
    return WardrobeItem.fromJson(decodeResponse(response));
  }

  Future<void> uploadWardrobeImage(
    String accessToken,
    String itemId,
    String fileName,
    String contentType,
    List<int> bytes,
  ) async {
    final signed = decodeResponse(
      await _http.post(
        endpoint('/wardrobe/items/$itemId/upload-url'),
        headers: jsonHeaders(accessToken),
        body: jsonEncode({
          'fileName': fileName,
          'contentType': contentType,
          'byteSize': bytes.length,
        }),
      ),
    );
    final uploadHeaders = (signed['headers'] as Map<String, dynamic>? ?? {})
        .map((key, value) => MapEntry(key, value.toString()));
    uploadHeaders.putIfAbsent('Content-Type', () => contentType);
    final upload = await _http.put(
      Uri.parse(signed['uploadUrl'].toString()),
      headers: uploadHeaders,
      body: bytes,
    );
    if (upload.statusCode < 200 || upload.statusCode >= 300) {
      throw ClorisaApiException(
        'Image upload failed with status ${upload.statusCode}.',
      );
    }
    await _http.post(
      endpoint('/wardrobe/items/$itemId/images/${signed['imageId']}/complete'),
      headers: authHeaders(accessToken),
    );
  }

  Future<List<OutfitPlan>> listOutfits(String accessToken) async {
    final response = await _http.get(
      endpoint('/outfits'),
      headers: authHeaders(accessToken),
    );
    final body = decodeResponse(response);
    final rows = body is List<dynamic> ? body : <dynamic>[];
    return rows
        .map((item) => OutfitPlan.fromJson(item as Map<String, dynamic>))
        .toList();
  }

  Future<OutfitPlan> createOutfit(
    String accessToken,
    List<String> itemIds,
  ) async {
    final response = await _http.post(
      endpoint('/outfits'),
      headers: jsonHeaders(accessToken),
      body: jsonEncode({
        'name': 'Mobile outfit',
        'occasion': 'Daily',
        'itemIds': itemIds,
      }),
    );
    return OutfitPlan.fromJson(decodeResponse(response));
  }

  Future<OutfitPlan> duplicateOutfit(
    String accessToken,
    String outfitId,
  ) async {
    final response = await _http.post(
      endpoint('/outfits/$outfitId/duplicate'),
      headers: jsonHeaders(accessToken),
    );
    return OutfitPlan.fromJson(decodeResponse(response));
  }

  Future<String> recommendOutfit(String accessToken, String prompt) async {
    final response = await _http.post(
      endpoint('/ai/recommend-outfit'),
      headers: jsonHeaders(accessToken),
      body: jsonEncode({'prompt': prompt}),
    );
    final body = decodeResponse(response);
    return body['explanation']?.toString() ??
        body['title']?.toString() ??
        'Recommendation ready.';
  }

  Future<String> shoppingCheck(String accessToken, String itemName) async {
    final response = await _http.post(
      endpoint('/ai/shopping-check'),
      headers: jsonHeaders(accessToken),
      body: jsonEncode({'itemName': itemName}),
    );
    final body = decodeResponse(response);
    return body['explanation']?.toString() ??
        body['recommendation']?.toString() ??
        'Shopping check ready.';
  }

  Future<AuthUser> updateProfile(
    String accessToken,
    String name,
    String email,
  ) async {
    final response = await _http.patch(
      endpoint('/profile'),
      headers: jsonHeaders(accessToken),
      body: jsonEncode({'name': name, 'email': email}),
    );
    final body = decodeResponse(response);
    return AuthUser.fromJson(body);
  }

  Future<AuthSessionPayload> _auth(
    String path,
    Map<String, Object?> body,
  ) async {
    final response = await _http.post(
      endpoint(path),
      headers: jsonHeaders(),
      body: jsonEncode(body),
    );
    final decoded = decodeResponse(response);
    return AuthSessionPayload.fromJson(decoded);
  }

  Uri endpoint(String path) => Uri.parse('$baseUrl$path');

  Map<String, String> authHeaders(String accessToken) => {
    'Authorization': 'Bearer $accessToken',
    'Accept': 'application/json',
  };

  Map<String, String> jsonHeaders([String? bearerToken]) => {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    if (bearerToken != null) 'Authorization': 'Bearer $bearerToken',
  };

  dynamic decodeResponse(http.Response response) {
    final body = response.body.isEmpty
        ? <String, dynamic>{}
        : jsonDecode(response.body);
    if (response.statusCode == 401) {
      throw ClorisaUnauthorizedException(
        body is Map<String, dynamic>
            ? body['message']?.toString() ?? 'Unauthorized.'
            : 'Unauthorized.',
      );
    }
    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw ClorisaApiException(
        body is Map<String, dynamic>
            ? body['message']?.toString() ??
                  'Request failed with status ${response.statusCode}'
            : 'Request failed with status ${response.statusCode}',
      );
    }
    return body;
  }
}

class ClorisaApiException implements Exception {
  ClorisaApiException(this.message);

  final String message;
}

class ClorisaUnauthorizedException extends ClorisaApiException {
  ClorisaUnauthorizedException(super.message);
}

class AuthSessionPayload {
  AuthSessionPayload({required this.user, required this.tokens});

  final AuthUser user;
  final AuthTokens tokens;

  factory AuthSessionPayload.fromJson(Map<String, dynamic> json) {
    return AuthSessionPayload(
      user: AuthUser.fromJson(json['user'] as Map<String, dynamic>),
      tokens: AuthTokens.fromJson(json['tokens'] as Map<String, dynamic>),
    );
  }
}

class AuthUser {
  AuthUser({required this.id, required this.name, required this.email});

  final String id;
  final String name;
  final String email;

  factory AuthUser.fromJson(Map<String, dynamic> json) {
    return AuthUser(
      id: json['id'].toString(),
      name: json['name'].toString(),
      email: json['email'].toString(),
    );
  }
}

class AuthTokens {
  AuthTokens({required this.accessToken, required this.refreshToken});

  final String accessToken;
  final String refreshToken;

  factory AuthTokens.fromJson(Map<String, dynamic> json) {
    return AuthTokens(
      accessToken: json['accessToken'].toString(),
      refreshToken: json['refreshToken'].toString(),
    );
  }
}

class WardrobeItem {
  WardrobeItem({
    required this.id,
    required this.name,
    required this.category,
    required this.color,
    required this.tags,
    this.favorite = false,
    this.lastWorn = 'Not worn recently',
  });

  final String id;
  final String name;
  final String category;
  final String color;
  final List<String> tags;
  bool favorite;
  String lastWorn;

  factory WardrobeItem.fromJson(Map<String, dynamic> json) {
    final tags = (json['tags'] as List<dynamic>? ?? []).map((tag) {
      if (tag is Map<String, dynamic>) return tag['name'].toString();
      return tag.toString();
    }).toList();
    return WardrobeItem(
      name: (json['title'] ?? json['name'] ?? 'Wardrobe item').toString(),
      id: (json['id'] ?? '').toString(),
      category: (json['categoryName'] ?? json['category'] ?? 'Wardrobe')
          .toString(),
      color: (json['primaryColor'] ?? json['color'] ?? 'Neutral').toString(),
      tags: tags,
      favorite: json['isFavorite'] == true || json['favorite'] == true,
      lastWorn: json['lastWornAt']?.toString() ?? 'Not worn recently',
    );
  }
}

class OutfitPlan {
  OutfitPlan({
    required this.id,
    required this.title,
    required this.occasion,
    required this.date,
    required this.items,
  });

  final String id;
  final String title;
  final String occasion;
  final String date;
  final List<String> items;

  factory OutfitPlan.fromJson(Map<String, dynamic> json) {
    final items = (json['items'] as List<dynamic>? ?? [])
        .map(outfitItemName)
        .toList();
    return OutfitPlan(
      id: (json['id'] ?? '').toString(),
      title: (json['name'] ?? json['title'] ?? 'Outfit').toString(),
      occasion: (json['occasion'] ?? 'General').toString(),
      date: json['lastWornAt']?.toString() ?? 'Planned',
      items: items,
    );
  }
}

String outfitItemName(dynamic item) {
  if (item is! Map<String, dynamic>) return item.toString();
  final wardrobeItem = item['wardrobeItem'];
  if (wardrobeItem is Map<String, dynamic>) {
    return (wardrobeItem['title'] ?? wardrobeItem['name'] ?? 'Wardrobe item')
        .toString();
  }
  return 'Wardrobe item';
}

class AuthScreen extends StatefulWidget {
  const AuthScreen({
    required this.onLogin,
    required this.onRegister,
    required this.onOfflineDemo,
    super.key,
  });

  final Future<void> Function(String email, String password) onLogin;
  final Future<void> Function(String name, String email, String password)
  onRegister;
  final VoidCallback onOfflineDemo;

  @override
  State<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends State<AuthScreen> {
  final nameController = TextEditingController(text: 'Himanshu');
  final emailController = TextEditingController(text: 'himanshu@example.com');
  final passwordController = TextEditingController(text: 'clorisa-demo');
  bool isSubmitting = false;
  String? errorMessage;

  @override
  void dispose() {
    nameController.dispose();
    emailController.dispose();
    passwordController.dispose();
    super.dispose();
  }

  Future<void> submit(Future<void> Function() action) async {
    setState(() {
      isSubmitting = true;
      errorMessage = null;
    });
    try {
      await action();
    } catch (error) {
      setState(
        () => errorMessage = error is ClorisaApiException
            ? error.message
            : 'Unable to reach Clorisa API.',
      );
    } finally {
      if (mounted) setState(() => isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(24),
          children: [
            const SizedBox(height: 48),
            const Text(
              'Clorisa',
              style: TextStyle(fontSize: 42, fontWeight: FontWeight.w800),
            ),
            const SizedBox(height: 8),
            Text(
              'Your wardrobe, outfits, calendar, AI stylist, and shopping decisions in one private mobile app.',
              style: Theme.of(context).textTheme.bodyLarge,
            ),
            const SizedBox(height: 32),
            TextField(
              controller: nameController,
              decoration: const InputDecoration(
                labelText: 'Name',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: emailController,
              decoration: const InputDecoration(
                labelText: 'Email',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: passwordController,
              obscureText: true,
              decoration: const InputDecoration(
                labelText: 'Password',
                border: OutlineInputBorder(),
              ),
            ),
            if (errorMessage != null)
              Padding(
                padding: const EdgeInsets.only(top: 12),
                child: Text(
                  errorMessage!,
                  style: TextStyle(color: Theme.of(context).colorScheme.error),
                ),
              ),
            const SizedBox(height: 16),
            FilledButton.icon(
              onPressed: isSubmitting
                  ? null
                  : () => submit(
                      () => widget.onLogin(
                        emailController.text,
                        passwordController.text,
                      ),
                    ),
              icon: const Icon(Icons.login),
              label: Text(isSubmitting ? 'Signing in...' : 'Sign in'),
            ),
            TextButton(
              onPressed: isSubmitting
                  ? null
                  : () => submit(
                      () => widget.onRegister(
                        nameController.text,
                        emailController.text,
                        passwordController.text,
                      ),
                    ),
              child: const Text('Create account'),
            ),
            TextButton(onPressed: () {}, child: const Text('Forgot password')),
            TextButton(
              onPressed: widget.onOfflineDemo,
              child: const Text('Use offline demo'),
            ),
          ],
        ),
      ),
    );
  }
}

class HomeScreen extends StatelessWidget {
  const HomeScreen({required this.state, super.key});

  final ClorisaMobileState state;

  @override
  Widget build(BuildContext context) {
    return ScreenScaffold(
      title: 'Dashboard',
      subtitle: 'Good morning, ${state.userName}',
      children: [
        MetricRow(
          cards: [
            MetricCard(
              label: 'Wardrobe',
              value: '${state.wardrobe.length}',
              icon: Icons.checkroom,
            ),
            MetricCard(
              label: 'Outfits',
              value: '${state.outfits.length}',
              icon: Icons.style,
            ),
          ],
        ),
        const SectionTitle(title: 'Today'),
        ClorisaCard(
          child: ListTile(
            contentPadding: EdgeInsets.zero,
            leading: const Icon(Icons.event_available),
            title: Text(state.outfits.first.title),
            subtitle: Text(
              '${state.outfits.first.occasion} | ${state.outfits.first.items.join(', ')}',
            ),
          ),
        ),
        const SectionTitle(title: 'AI styling prompts'),
        for (final prompt in stylingPrompts.take(3)) PromptTile(prompt: prompt),
      ],
    );
  }
}

class WardrobeScreen extends StatelessWidget {
  const WardrobeScreen({
    required this.state,
    required this.onChanged,
    super.key,
  });

  final ClorisaMobileState state;
  final VoidCallback onChanged;

  @override
  Widget build(BuildContext context) {
    return ScreenScaffold(
      title: 'Wardrobe',
      subtitle: 'Search, favorite, upload, and mark worn',
      action: IconButton(
        key: const Key('wardrobe-add-item'),
        tooltip: 'Add item',
        onPressed: () async {
          try {
            await state.createWardrobeItem();
          } catch (_) {
            state.wardrobe.add(
              WardrobeItem(
                id: 'demo-${state.wardrobe.length + 1}',
                name: 'New capsule tee',
                category: 'Tops',
                color: 'White',
                tags: ['capsule'],
              ),
            );
          } finally {
            onChanged();
          }
        },
        icon: const Icon(Icons.add),
      ),
      children: [
        const TextField(
          decoration: InputDecoration(
            prefixIcon: Icon(Icons.search),
            labelText: 'Search wardrobe',
            border: OutlineInputBorder(),
          ),
        ),
        const SizedBox(height: 12),
        FilledButton.tonalIcon(
          onPressed: () async {
            await state.loadWardrobe();
            onChanged();
          },
          icon: const Icon(Icons.sync),
          label: const Text('Sync wardrobe'),
        ),
        const SizedBox(height: 8),
        for (final item in state.wardrobe)
          ClorisaCard(
            child: ListTile(
              contentPadding: EdgeInsets.zero,
              leading: CircleAvatar(
                backgroundColor: swatchFor(item.color),
                child: const Icon(Icons.checkroom),
              ),
              title: Text(item.name),
              subtitle: Text(
                '${item.category} | ${item.color} | ${item.tags.join(', ')}',
              ),
              trailing: Wrap(
                children: [
                  IconButton(
                    tooltip: 'Favorite',
                    onPressed: () async {
                      await state.toggleFavorite(item);
                      onChanged();
                    },
                    icon: Icon(
                      item.favorite ? Icons.favorite : Icons.favorite_border,
                    ),
                  ),
                  IconButton(
                    tooltip: 'Mark worn',
                    onPressed: () async {
                      await state.markWorn(item);
                      onChanged();
                    },
                    icon: const Icon(Icons.done),
                  ),
                  IconButton(
                    tooltip: 'Upload image',
                    onPressed: () async {
                      await state.uploadWardrobeImage(item);
                      onChanged();
                    },
                    icon: const Icon(Icons.cloud_upload_outlined),
                  ),
                ],
              ),
            ),
          ),
      ],
    );
  }
}

class OutfitsScreen extends StatelessWidget {
  const OutfitsScreen({
    required this.state,
    required this.onChanged,
    super.key,
  });

  final ClorisaMobileState state;
  final VoidCallback onChanged;

  @override
  Widget build(BuildContext context) {
    return ScreenScaffold(
      title: 'Outfits',
      subtitle: 'Build looks and plan your calendar',
      action: IconButton(
        key: const Key('outfit-create'),
        tooltip: 'Create outfit',
        onPressed: () async {
          try {
            await state.createOutfit();
          } catch (_) {
            state.outfits.add(
              OutfitPlan(
                id: 'demo-outfit-${state.outfits.length + 1}',
                title: 'Comfortable travel outfit',
                occasion: 'Travel',
                date: 'Friday',
                items: ['Charcoal tailored trousers'],
              ),
            );
          } finally {
            onChanged();
          }
        },
        icon: const Icon(Icons.add),
      ),
      children: [
        SegmentedButton<int>(
          segments: const [
            ButtonSegment(
              value: 0,
              icon: Icon(Icons.style),
              label: Text('Outfits'),
            ),
            ButtonSegment(
              value: 1,
              icon: Icon(Icons.calendar_month),
              label: Text('Calendar'),
            ),
          ],
          selected: const {0},
        ),
        const SizedBox(height: 12),
        for (final outfit in state.outfits)
          ClorisaCard(
            child: ListTile(
              contentPadding: EdgeInsets.zero,
              leading: const Icon(Icons.style),
              title: Text(outfit.title),
              subtitle: Text(
                '${outfit.date} | ${outfit.occasion} | ${outfit.items.join(', ')}',
              ),
              trailing: IconButton(
                tooltip: 'Duplicate',
                icon: const Icon(Icons.copy),
                onPressed: () async {
                  await state.duplicateOutfit(outfit);
                  onChanged();
                },
              ),
            ),
          ),
      ],
    );
  }
}

class AiScreen extends StatelessWidget {
  const AiScreen({required this.state, super.key});

  final ClorisaMobileState state;

  @override
  Widget build(BuildContext context) {
    return ScreenScaffold(
      title: 'AI Stylist',
      subtitle: 'Styling, shopping, image analysis, and providers',
      children: [
        const SectionTitle(title: 'Stylist'),
        for (final prompt in stylingPrompts)
          PromptTile(
            prompt: prompt,
            onPressed: () async {
              final result = await state.recommendOutfit(prompt);
              if (context.mounted) {
                ScaffoldMessenger.of(
                  context,
                ).showSnackBar(SnackBar(content: Text(result)));
              }
            },
          ),
        const SectionTitle(title: 'Shopping assistant'),
        ClorisaCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Check before you buy',
                style: TextStyle(fontWeight: FontWeight.w700),
              ),
              const SizedBox(height: 8),
              const TextField(
                decoration: InputDecoration(
                  labelText: 'Item you are considering',
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 12),
              FilledButton.icon(
                onPressed: () async {
                  final result = await state.shoppingCheck(
                    'Cream oversized blazer',
                  );
                  if (context.mounted) {
                    ScaffoldMessenger.of(
                      context,
                    ).showSnackBar(SnackBar(content: Text(result)));
                  }
                },
                icon: const Icon(Icons.manage_search),
                label: const Text('Check duplicates'),
              ),
            ],
          ),
        ),
        const SectionTitle(title: 'Provider settings'),
        const ClorisaCard(
          child: Column(
            children: [
              SwitchListTile(
                value: true,
                onChanged: null,
                title: Text('Clorisa Native AI'),
              ),
              ListTile(
                leading: Icon(Icons.key),
                title: Text('OpenAI, Claude, Gemini, Azure, Ollama, custom'),
                subtitle: Text('Connect securely from settings'),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({required this.state, required this.onLogout, super.key});

  final ClorisaMobileState state;
  final Future<void> Function() onLogout;

  @override
  Widget build(BuildContext context) {
    return ScreenScaffold(
      title: 'Profile',
      subtitle: state.email,
      children: [
        ClorisaCard(
          child: Column(
            children: [
              TextField(
                controller: TextEditingController(text: state.userName),
                decoration: const InputDecoration(
                  labelText: 'Name',
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: TextEditingController(text: state.email),
                decoration: const InputDecoration(
                  labelText: 'Email',
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 12),
              FilledButton.icon(
                onPressed: () =>
                    state.updateProfile(state.userName, state.email),
                icon: const Icon(Icons.save),
                label: const Text('Save profile'),
              ),
            ],
          ),
        ),
        const ClorisaCard(
          child: Column(
            children: [
              SwitchListTile(
                value: true,
                onChanged: null,
                title: Text('Outfit reminders'),
              ),
              SwitchListTile(
                value: true,
                onChanged: null,
                title: Text('AI confidence warnings'),
              ),
              SwitchListTile(
                value: false,
                onChanged: null,
                title: Text('Opt in to AI training data'),
              ),
            ],
          ),
        ),
        OutlinedButton.icon(
          onPressed: onLogout,
          icon: const Icon(Icons.logout),
          label: const Text('Logout'),
        ),
      ],
    );
  }
}

class ScreenScaffold extends StatelessWidget {
  const ScreenScaffold({
    required this.title,
    required this.subtitle,
    required this.children,
    this.action,
    super.key,
  });

  final String title;
  final String subtitle;
  final List<Widget> children;
  final Widget? action;

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 18, 16, 28),
      children: [
        Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(subtitle, style: Theme.of(context).textTheme.bodyMedium),
                ],
              ),
            ),
            ?action,
          ],
        ),
        const SizedBox(height: 18),
        ...children,
      ],
    );
  }
}

class ClorisaCard extends StatelessWidget {
  const ClorisaCard({required this.child, super.key});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 0,
      margin: const EdgeInsets.only(bottom: 12),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(8),
        side: BorderSide(color: Colors.black.withValues(alpha: 0.08)),
      ),
      child: Padding(padding: const EdgeInsets.all(14), child: child),
    );
  }
}

class MetricRow extends StatelessWidget {
  const MetricRow({required this.cards, super.key});

  final List<MetricCard> cards;

  @override
  Widget build(BuildContext context) {
    return Row(children: cards.map((card) => Expanded(child: card)).toList());
  }
}

class MetricCard extends StatelessWidget {
  const MetricCard({
    required this.label,
    required this.value,
    required this.icon,
    super.key,
  });

  final String label;
  final String value;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return ClorisaCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon),
          const SizedBox(height: 10),
          Text(
            value,
            style: Theme.of(
              context,
            ).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w800),
          ),
          Text(label),
        ],
      ),
    );
  }
}

class SectionTitle extends StatelessWidget {
  const SectionTitle({required this.title, super.key});

  final String title;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(2, 10, 2, 8),
      child: Text(
        title,
        style: Theme.of(
          context,
        ).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800),
      ),
    );
  }
}

class PromptTile extends StatelessWidget {
  const PromptTile({required this.prompt, this.onPressed, super.key});

  final String prompt;
  final VoidCallback? onPressed;

  @override
  Widget build(BuildContext context) {
    return ClorisaCard(
      child: ListTile(
        contentPadding: EdgeInsets.zero,
        leading: const Icon(Icons.auto_awesome),
        title: Text(prompt),
        subtitle: const Text('Uses owned wardrobe items only'),
        trailing: IconButton(
          tooltip: 'Ask AI',
          icon: const Icon(Icons.arrow_forward),
          onPressed: onPressed,
        ),
      ),
    );
  }
}

String contentTypeFor(String name) {
  final lower = name.toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.heic')) return 'image/heic';
  if (lower.endsWith('.heif')) return 'image/heif';
  return 'image/jpeg';
}

Color swatchFor(String color) {
  switch (color.toLowerCase()) {
    case 'rose':
      return const Color(0xFFD8A0A6);
    case 'gold':
      return const Color(0xFFD6B25E);
    case 'charcoal':
      return const Color(0xFF4B4B4B);
    default:
      return const Color(0xFFECE5DA);
  }
}

const stylingPrompts = [
  'Create a polished dinner outfit using items I have not worn recently.',
  'Style me for an office presentation with a clean, elegant, confident look.',
  'Suggest a wedding guest outfit with rose or gold tones from my wardrobe.',
  'Build a comfortable travel outfit that still looks put together.',
  'Give me a minimalist capsule outfit using neutral colors and reusable pieces.',
];
