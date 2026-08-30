import 'package:closira_mobile/main.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  testWidgets('mobile smoke flow opens each primary Closira tab', (
    tester,
  ) async {
    final state = ClosiraMobileState()..isLoadingSession = false;
    await tester.pumpWidget(ClosiraMobileApp(initialState: state));

    await tester.drag(find.byType(ListView), const Offset(0, -300));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Use offline demo'));
    await tester.pumpAndSettle();

    expect(find.text('Dashboard'), findsOneWidget);

    await tester.tap(find.byIcon(Icons.checkroom_outlined));
    await tester.pumpAndSettle();
    expect(find.text('Wardrobe'), findsWidgets);

    await tester.tap(find.byIcon(Icons.style_outlined));
    await tester.pumpAndSettle();
    expect(find.text('Outfits'), findsWidgets);

    await tester.tap(find.byIcon(Icons.auto_awesome_outlined));
    await tester.pumpAndSettle();
    expect(find.text('AI Stylist'), findsOneWidget);

    await tester.tap(find.byIcon(Icons.person_outline));
    await tester.pumpAndSettle();
    expect(find.text('Profile'), findsOneWidget);
  });
}
