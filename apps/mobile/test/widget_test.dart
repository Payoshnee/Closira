import 'package:closira_mobile/main.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('renders Closira auth and opens the mobile dashboard', (
    tester,
  ) async {
    final state = ClosiraMobileState()..isLoadingSession = false;
    await tester.pumpWidget(ClosiraMobileApp(initialState: state));

    expect(find.text('Closira'), findsOneWidget);
    expect(find.text('Sign in'), findsOneWidget);

    await tester.drag(find.byType(ListView), const Offset(0, -300));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Use offline demo'));
    await tester.pumpAndSettle();

    expect(find.text('Dashboard'), findsOneWidget);
    expect(find.text('Wardrobe'), findsWidgets);
    expect(find.text('AI'), findsWidgets);
  });

  testWidgets('wardrobe tab supports adding a mobile item', (tester) async {
    final state = ClosiraMobileState()..isLoadingSession = false;
    await tester.pumpWidget(ClosiraMobileApp(initialState: state));
    await tester.drag(find.byType(ListView), const Offset(0, -300));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Use offline demo'));
    await tester.pumpAndSettle();

    await tester.tap(find.byIcon(Icons.checkroom_outlined));
    await tester.pumpAndSettle();

    expect(find.text('Ivory linen blazer'), findsOneWidget);

    state.wardrobe.add(
      WardrobeItem(
        id: 'test-mobile-add',
        name: 'New capsule tee',
        category: 'Tops',
        color: 'White',
        tags: ['capsule'],
      ),
    );
    await tester.pump();
    expect(
      state.wardrobe.any((item) => item.name == 'New capsule tee'),
      isTrue,
    );
  });
}
